import { NotFoundError } from "elysia";
import { ReservationCyclesService } from "../services/reservation_cycles";
import {
    insertReservationCycleSchema,
    updateReservationCycleSchema,
    patchReservationCycleSchema,
    reservationCyclesQuerySchema
} from "../models/reservation_cycles";
import { selectCompositeReservationCycleSchema, paginatedReservationCyclesResponseSchema } from "../models/composite";

export const ReservationCyclesController = {
    async getAll({ query }: { query: typeof reservationCyclesQuerySchema.static }): Promise<typeof paginatedReservationCyclesResponseSchema.static> {
        return await ReservationCyclesService.getAll(query) as typeof paginatedReservationCyclesResponseSchema.static;
    },

    async getById({ params: { id } }: { params: { id: string } }): Promise<typeof selectCompositeReservationCycleSchema.static> {
        const cycle = await ReservationCyclesService.getById(id);
        if (!cycle) throw new NotFoundError( "Reservation Cycle not found");
        return cycle as typeof selectCompositeReservationCycleSchema.static;
    },

    async create({ body }: { body: typeof insertReservationCycleSchema.static }): Promise<typeof selectCompositeReservationCycleSchema.static> {
        const created = await ReservationCyclesService.create(body);
        if (!created) throw new NotFoundError( "Reservation Cycle not found");
        return created as typeof selectCompositeReservationCycleSchema.static;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateReservationCycleSchema.static }): Promise<typeof selectCompositeReservationCycleSchema.static> {
        const updated = await ReservationCyclesService.update(id, body);
        if (!updated) throw new NotFoundError( "Reservation Cycle not found");
        return updated as typeof selectCompositeReservationCycleSchema.static;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchReservationCycleSchema.static }): Promise<typeof selectCompositeReservationCycleSchema.static> {
        const patched = await ReservationCyclesService.patch(id, body);
        if (!patched) throw new NotFoundError( "Reservation Cycle not found");
        return patched as typeof selectCompositeReservationCycleSchema.static;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await ReservationCyclesService.remove(id);
        if (!removed) throw new NotFoundError( "Reservation Cycle not found");
        return { success: true, cycle: removed };
    }
} as const;
