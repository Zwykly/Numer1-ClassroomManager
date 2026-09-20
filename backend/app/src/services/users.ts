import { eq, inArray } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { user as authUser } from "../../auth-schema";
import { insertUserSchema, updateUserSchema, patchUserSchema, usersQuerySchema } from "../models/users";
import { OnlineClassroomsService } from "./online_classrooms";
import { TeacherStudentsService } from "./teacher_students";
import { getLimit, getCursorWhere, getInArrayWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";

export const UsersService = {
    async getAll(query: typeof usersQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const roleWhere = getInArrayWhere("role", query.role);
        const searchWhere = getFuzzySearchWhere(["firstName", "lastName", "email"], query.search);

        const conditions = [cursorWhere, roleWhere, searchWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const usersData = await db.query.users.findMany({
            where: whereClause,
            limit,
            orderBy: (users, { asc }) => [asc(users.id)],
            with: {
                groups: true,
                students: true,
                classroomReservations: true,
                onlineClassrooms: true,
            }
        });

        const mappedUsers = usersData.map(user => ({
            ...user,
            groups: user.groups,
            students: user.students,
            reservations: user.classroomReservations,
            onlineClassroom: user.onlineClassrooms.length > 0 ? user.onlineClassrooms[0] : undefined,
        }));

        return buildPaginationResponse(mappedUsers, query.limit);
    },

    async getById(id: string) {
        const user = await db.query.users.findFirst({
            where: { id },
            with: {
                groups: true,
                students: true,
                classroomReservations: true,
                onlineClassrooms: true,
            }
        });

        if (!user) return null;

        return {
            ...user,
            groups: user.groups,
            students: user.students,
            reservations: user.classroomReservations,
            onlineClassroom: user.onlineClassrooms.length > 0 ? user.onlineClassrooms[0] : undefined,
        };
    },

    async getByAuthId(authId: string) {
        const user = await db.query.users.findFirst({
            where: { authId },
            with: {
                groups: true,
                students: true,
                classroomReservations: true,
                onlineClassrooms: true,
            }
        });

        if (!user) return null;
        
        return {
            ...user,
            groups: user.groups,
            students: user.students,
            reservations: user.classroomReservations,
            onlineClassroom: user.onlineClassrooms.length > 0 ? user.onlineClassrooms[0] : undefined,
        };
    },

    async create(payload: typeof insertUserSchema.static) {
        const [newUser] = await db
            .insert(table.users)
            .values(payload)
            .returning();
        await this.ensureOnlineClassroom(newUser.id, newUser.firstName, newUser.lastName);
        return this.getById(newUser.id);
    },

    // Every user gets their own online classroom so classes can be hosted online
    // without additional setup.
    async ensureOnlineClassroom(userId: string, firstName: string, lastName: string) {
        const existing = await OnlineClassroomsService.getByTeacherId(userId);
        if (existing) return existing;

        const created = await OnlineClassroomsService.create({
            name: `${firstName} ${lastName} - online`,
            teacherId: userId,
            comment: null,
            status: "active",
        });
        return created?.id ?? null;
    },

    async setGroups(userId: string, groupIds?: string[]) {
        if (!groupIds) return;

        await db.delete(table.teacherGroups).where(eq(table.teacherGroups.teacherId, userId));
        if (groupIds.length > 0) {
            await db.insert(table.teacherGroups).values(
                groupIds.map((groupId) => ({ groupId, teacherId: userId })),
            );
        }
    },

    async setStudents(userId: string, studentIds?: string[]) {
        if (!studentIds) return;

        await db.delete(table.teacherStudents).where(eq(table.teacherStudents.teacherId, userId));
        if (studentIds.length > 0) {
            await db.insert(table.teacherStudents).values(
                studentIds.map((studentId) => ({ studentId, teacherId: userId })),
            );
        }
    },

    // Persists the teacher's student list. Members of any assigned group are
    // always included, while explicit removals are respected because groups are
    // written first and no longer contribute their (removed) members.
    async syncTeacherStudents(userId: string, groupIds?: string[], studentIds?: string[]) {
        if (groupIds === undefined && studentIds === undefined) return;

        const current = await TeacherStudentsService.getStudentIds(userId);
        const groups = groupIds ?? (await TeacherStudentsService.getGroupIdsForTeacher(userId));
        const groupMembers = await TeacherStudentsService.getStudentIdsForGroups(groups);
        const base = studentIds ?? current;
        const effective = [...new Set([...base, ...groupMembers])];

        await this.setStudents(userId, effective);
    },

    async update(id: string, payload: typeof updateUserSchema.static) {
        const { groupIds, studentIds, ...user } = payload;
        if (Object.keys(user).length > 0) {
            const [updatedUser] = await db
                .update(table.users)
                .set(user)
                .where(eq(table.users.id, id))
                .returning();
            if (!updatedUser) return null;
            await this.syncAuthUser(updatedUser);
        }
        await this.setGroups(id, groupIds);
        await this.syncTeacherStudents(id, groupIds, studentIds);
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchUserSchema.static) {
        const { groupIds, studentIds, ...user } = payload;
        if (Object.keys(user).length > 0) {
            const [patchedUser] = await db
                .update(table.users)
                .set(user)
                .where(eq(table.users.id, id))
                .returning();
            if (!patchedUser) return null;
            await this.syncAuthUser(patchedUser);
        }
        await this.setGroups(id, groupIds);
        await this.syncTeacherStudents(id, groupIds, studentIds);
        return this.getById(id);
    },

    async syncAuthUser(user: { authId: string | null; firstName: string; lastName: string; email: string }) {
        if (!user.authId) return;
        await db
            .update(authUser)
            .set({
                name: `${user.firstName} ${user.lastName}`.trim(),
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            })
            .where(eq(authUser.id, user.authId));
    },

    async remove(id: string) {
        // Reservations, cycles and the teacher's online classroom reference the
        // user, so they have to be cleared before the account can be deleted.
        const onlineClassrooms = await db
            .select({ id: table.onlineClassrooms.id })
            .from(table.onlineClassrooms)
            .where(eq(table.onlineClassrooms.teacherId, id));
        const onlineClassroomIds = onlineClassrooms.map((classroom) => classroom.id);

        const owned = await db
            .select({ id: table.classroomReservations.id })
            .from(table.classroomReservations)
            .where(eq(table.classroomReservations.teacherId, id));
        const hosted = onlineClassroomIds.length > 0
            ? await db
                .select({ id: table.classroomReservations.id })
                .from(table.classroomReservations)
                .where(inArray(table.classroomReservations.onlineClassroomId, onlineClassroomIds))
            : [];
        const reservationIds = [...new Set([...owned, ...hosted].map((reservation) => reservation.id))];

        if (reservationIds.length > 0) {
            await db.delete(table.reservationStudents).where(inArray(table.reservationStudents.reservationId, reservationIds));
            await db.delete(table.reservationGroups).where(inArray(table.reservationGroups.reservationId, reservationIds));
            await db.delete(table.classroomReservations).where(inArray(table.classroomReservations.id, reservationIds));
        }
        await db.delete(table.reservationCycles).where(eq(table.reservationCycles.teacherId, id));
        await db.delete(table.onlineClassrooms).where(eq(table.onlineClassrooms.teacherId, id));

        await db.delete(table.teacherStudents).where(eq(table.teacherStudents.teacherId, id));
        await db.delete(table.teacherGroups).where(eq(table.teacherGroups.teacherId, id));

        const [removedUser] = await db
            .delete(table.users)
            .where(eq(table.users.id, id))
            .returning();
        if (removedUser?.authId) {
            await db.delete(authUser).where(eq(authUser.id, removedUser.authId));
        }
        return removedUser;
    }
};
