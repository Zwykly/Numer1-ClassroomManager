import { eq, and } from "drizzle-orm";
import { db } from "../db/db";
import { table } from "../db/schema";
import { insertReservationCycleSchema, updateReservationCycleSchema, patchReservationCycleSchema, reservationCyclesQuerySchema } from "../models/reservation_cycles";
import { getLimit, getCursorWhere, getInArrayWhere, buildPaginationResponse } from "../utils/drizzle";

export const ReservationCyclesService = {
    async getAll(query: typeof reservationCyclesQuerySchema.static) {
        const limit = getLimit(query.limit);
        const cursorWhere = getCursorWhere(query.cursor);
        const statusWhere = getInArrayWhere("status", query.status);

        const conditions = [cursorWhere, statusWhere].filter(Boolean);
        const whereClause = conditions.length > 0 ? (conditions.length === 1 ? conditions[0] : { AND: conditions }) : undefined;

        const data = await db.query.reservationCycles.findMany({
            where: whereClause,
            limit,
            orderBy: (cycles, { asc }) => [asc(cycles.id)],
            with: {
                users: true,
                classroomReservations: true,
            }
        });

        const mapped = data.map(c => {
            const { users, classroomReservations, ...cycle } = c;
            return {
                ...cycle,
                teacher: users
                    ? {
                        id: users.id,
                        firstName: users.firstName,
                        lastName: users.lastName,
                    }
                    : undefined,
                reservations: classroomReservations,
            };
        });

        return buildPaginationResponse(mapped, query.limit);
    },

    async getById(id: string) {
        const cycle = await db.query.reservationCycles.findFirst({
            where: { id },
            with: {
                users: true,
                classroomReservations: true,
            }
        });

        if (!cycle) return null;

        const { users, classroomReservations, ...cycleBase } = cycle;

        return {
            ...cycleBase,
            teacher: users
                ? {
                    id: users.id,
                    firstName: users.firstName,
                    lastName: users.lastName,
                }
                : undefined,
            reservations: classroomReservations,
        };
    },

    async create(payload: typeof insertReservationCycleSchema.static) {
        const [inserted] = await db
            .insert(table.reservationCycles)
            .values(payload)
            .returning();
        return this.getById(inserted.id);
    },

    async update(id: string, payload: typeof updateReservationCycleSchema.static) {
        const [updated] = await db
            .update(table.reservationCycles)
            .set(payload)
            .where(eq(table.reservationCycles.id, id))
            .returning();
        if (!updated) return null;
        return this.getById(id);
    },

    async patch(id: string, payload: typeof patchReservationCycleSchema.static) {
        const [patched] = await db
            .update(table.reservationCycles)
            .set(payload)
            .where(eq(table.reservationCycles.id, id))
            .returning();
        if (!patched) return null;
        return this.getById(id);
    },

    async remove(id: string) {
        const [removed] = await db
            .delete(table.reservationCycles)
            .where(eq(table.reservationCycles.id, id))
            .returning();
        return removed;
    }
};
