import { eq } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { createGroupSchema, updateGroupSchema, patchGroupSchema, groupsQuerySchema } from "../models/groups";
import { getLimit, getCursorWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";
import { TeacherStudentsService } from "./teacher_students";

type Viewer = {
    id?: string;
    isAdmin: boolean;
};

export const GroupsService = {
    async getAll(query: typeof groupsQuerySchema.static, viewer?: Viewer) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const searchWhere = getFuzzySearchWhere(["name"], query.search);
        const viewerWhere = viewer && !viewer.isAdmin && viewer.id
            ? { teachers: { id: viewer.id } }
            : undefined;

        const conditions = [cursorWhere, searchWhere, viewerWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const groupsData = await db.query.groups.findMany({
            where: whereClause,
            limit,
            orderBy: (groups, { asc }) => [asc(groups.id)],
            with: {
                students: true,
                teachers: true,
                reservations: true,
            }
        });

        const mappedGroups = groupsData.map(group => ({
            ...group,
            students: group.students,
            users: group.teachers,
            reservations: group.reservations,
        }));

        return buildPaginationResponse(mappedGroups, query.limit);
    },

    async getById(id: string, viewer?: Viewer) {
        const group = await db.query.groups.findFirst({
            where: { id },
            with: {
                students: true,
                teachers: true,
                reservations: true,
            }
        });

        if (!group) return null;
        if (viewer && !viewer.isAdmin && viewer.id && !group.teachers.some((teacher) => teacher.id === viewer.id)) {
            return null;
        }

        return {
            ...group,
            students: group.students,
            users: group.teachers,
            reservations: group.reservations,
        };
    },

    async setStudents(groupId: string, studentIds?: string[]) {
        if (!studentIds) return;

        await db.delete(table.groupStudents).where(eq(table.groupStudents.groupId, groupId));
        if (studentIds.length > 0) {
            await db.insert(table.groupStudents).values(
                studentIds.map((studentId) => ({ groupId, studentId })),
            );
        }

        // Every teacher of the group automatically receives its members.
        const teacherIds = await TeacherStudentsService.getTeacherIdsForGroup(groupId);
        for (const teacherId of teacherIds) {
            await TeacherStudentsService.addStudents(teacherId, studentIds);
        }
    },

    async setTeachers(groupId: string, teacherIds?: string[]) {
        if (!teacherIds) return;

        const previous = await db
            .select({ teacherId: table.teacherGroups.teacherId })
            .from(table.teacherGroups)
            .where(eq(table.teacherGroups.groupId, groupId));
        const previousIds = new Set(previous.map((row) => row.teacherId));

        await db.delete(table.teacherGroups).where(eq(table.teacherGroups.groupId, groupId));
        if (teacherIds.length > 0) {
            await db.insert(table.teacherGroups).values(
                teacherIds.map((teacherId) => ({ groupId, teacherId })),
            );
        }

        // Newly assigned teachers inherit every student already in the group.
        const added = teacherIds.filter((teacherId) => !previousIds.has(teacherId));
        if (added.length > 0) {
            const studentIds = await TeacherStudentsService.getStudentIdsForGroups([groupId]);
            for (const teacherId of added) {
                await TeacherStudentsService.addStudents(teacherId, studentIds);
            }
        }
    },

    async create(payload: typeof createGroupSchema.static, viewer?: Viewer) {
        const { studentIds, teacherIds, ...group } = payload;
        const [newGroup] = await db
            .insert(table.groups)
            .values(group)
            .returning();
        await this.setStudents(newGroup.id, studentIds);

        // A teacher creating a group is automatically associated with it.
        const assignedTeacherIds = viewer && !viewer.isAdmin && viewer.id ? [viewer.id] : teacherIds;
        await this.setTeachers(newGroup.id, assignedTeacherIds);

        return this.getById(newGroup.id);
    },

    async update(id: string, payload: typeof updateGroupSchema.static) {
        const { studentIds, teacherIds, ...group } = payload;
        const [updatedGroup] = await db
            .update(table.groups)
            .set(group)
            .where(eq(table.groups.id, id))
            .returning();
        if (!updatedGroup) return null;
        await this.setStudents(id, studentIds);
        await this.setTeachers(id, teacherIds);
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchGroupSchema.static) {
        const { studentIds, teacherIds, ...group } = payload;
        const [patchedGroup] = await db
            .update(table.groups)
            .set(group)
            .where(eq(table.groups.id, id))
            .returning();
        if (!patchedGroup) return null;
        await this.setStudents(id, studentIds);
        await this.setTeachers(id, teacherIds);
        return this.getById(id);
    },

    async remove(id: string) {
        await db.delete(table.groupStudents).where(eq(table.groupStudents.groupId, id));
        await db.delete(table.teacherGroups).where(eq(table.teacherGroups.groupId, id));
        await db.delete(table.reservationGroups).where(eq(table.reservationGroups.groupId, id));

        const [removedGroup] = await db
            .delete(table.groups)
            .where(eq(table.groups.id, id))
            .returning();
        return removedGroup;
    }
};
