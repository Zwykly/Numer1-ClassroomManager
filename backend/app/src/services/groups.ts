import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertGroupSchema, updateGroupSchema, patchGroupSchema, groupsQuerySchema } from "../models/groups";
import { getLimit, getCursorWhere, getFuzzySearchWhere, buildPaginationResponse } from "../utils/drizzle";

export const GroupsService = {
    async getAll(query: typeof groupsQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const searchWhere = getFuzzySearchWhere(["name"], query.search);

        const conditions = [cursorWhere, searchWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const groupsData = await db.query.groups.findMany({
            where: whereClause,
            limit,
            orderBy: (groups, { asc }) => [asc(groups.id)],
            with: {
                students: true,
                teachers: true,
            }
        });

        const mappedGroups = groupsData.map(group => ({
            ...group,
            students: group.students,
            users: group.teachers,
        }));

        return buildPaginationResponse(mappedGroups, query.limit);
    },

    async getById(id: string) {
        const group = await db.query.groups.findFirst({
            where: { id },
            with: {
                students: true,
                teachers: true,
            }
        });

        if (!group) return null;

        return {
            ...group,
            students: group.students,
            users: group.teachers,
        };
    },

    async create(payload: typeof insertGroupSchema.static) {
        const [newGroup] = await db
            .insert(table.groups)
            .values(payload)
            .returning();
        return this.getById(newGroup.id);
    },

    async update(id: string, payload: typeof updateGroupSchema.static) {
        const [updatedGroup] = await db
            .update(table.groups)
            .set(payload)
            .where(eq(table.groups.id, id))
            .returning();
        if (!updatedGroup) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchGroupSchema.static) {
        const [patchedGroup] = await db
            .update(table.groups)
            .set(payload)
            .where(eq(table.groups.id, id))
            .returning();
        if (!patchedGroup) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removedGroup] = await db
            .delete(table.groups)
            .where(eq(table.groups.id, id))
            .returning();
        return removedGroup;
    }
};
