import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertUserSchema, updateUserSchema, patchUserSchema, usersQuerySchema } from "../models/users";
import { getLimit, getCursorWhere, getInArrayWhere, buildPaginationResponse } from "../utils/drizzle";

export const UsersService = {
    async getAll(query: typeof usersQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const roleWhere = getInArrayWhere("role", query.role);

        const conditions = [cursorWhere, roleWhere].filter(Boolean);
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
        return this.getById(newUser.id);
    },

    async update(id: string, payload: typeof updateUserSchema.static) {
        const [updatedUser] = await db
            .update(table.users)
            .set(payload)
            .where(eq(table.users.id, id))
            .returning();
        if (!updatedUser) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchUserSchema.static) {
        const [patchedUser] = await db
            .update(table.users)
            .set(payload)
            .where(eq(table.users.id, id))
            .returning();
        if (!patchedUser) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removedUser] = await db
            .delete(table.users)
            .where(eq(table.users.id, id))
            .returning();
        return removedUser;
    }
};
