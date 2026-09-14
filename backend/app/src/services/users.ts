import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { user as authUser } from "../../auth-schema";
import { insertUserSchema, updateUserSchema, patchUserSchema, usersQuerySchema } from "../models/users";
import { OnlineClassroomsService } from "./online_classrooms";
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
                classroomReservations: true,
                onlineClassrooms: true,
            }
        });

        const mappedUsers = usersData.map(user => ({
            ...user,
            groups: user.groups,
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
                classroomReservations: true,
                onlineClassrooms: true,
            }
        });

        if (!user) return null;

        return {
            ...user,
            groups: user.groups,
            reservations: user.classroomReservations,
            onlineClassroom: user.onlineClassrooms.length > 0 ? user.onlineClassrooms[0] : undefined,
        };
    },

    async getByAuthId(authId: string) {
        const user = await db.query.users.findFirst({
            where: { authId },
            with: {
                groups: true,
                classroomReservations: true,
                onlineClassrooms: true,
            }
        });

        if (!user) return null;
        
        return {
            ...user,
            groups: user.groups,
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

    async update(id: string, payload: typeof updateUserSchema.static) {
        const [updatedUser] = await db
            .update(table.users)
            .set(payload)
            .where(eq(table.users.id, id))
            .returning();
        if (!updatedUser) return null;
        await this.syncAuthUser(updatedUser);
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchUserSchema.static) {
        const [patchedUser] = await db
            .update(table.users)
            .set(payload)
            .where(eq(table.users.id, id))
            .returning();
        if (!patchedUser) return null;
        await this.syncAuthUser(patchedUser);
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
