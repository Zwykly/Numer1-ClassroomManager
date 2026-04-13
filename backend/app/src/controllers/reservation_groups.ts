import { NotFoundError } from "elysia";
import { ReservationGroupsService } from "../services/reservation_groups";
import { insertReservationGroupSchema, updateReservationGroupSchema, patchReservationGroupSchema, reservationGroupsQuerySchema } from "../models/reservation_groups";

export const ReservationGroupsController = {
    async getAll({ query }: { query: typeof reservationGroupsQuerySchema.static }) {
        return await ReservationGroupsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const rg = await ReservationGroupsService.getById(id);
        if (!rg) throw new NotFoundError( "Reservation Group relation not found");
        return rg;
    },

    async create({ body }: { body: typeof insertReservationGroupSchema.static }) {
        const created = await ReservationGroupsService.create(body);
        if (!created) throw new NotFoundError( "Reservation Group relation not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateReservationGroupSchema.static }) {
        const updated = await ReservationGroupsService.update(id, body);
        if (!updated) throw new NotFoundError( "Reservation Group relation not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchReservationGroupSchema.static }) {
        const patched = await ReservationGroupsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Reservation Group relation not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await ReservationGroupsService.remove(id);
        if (!removed) throw new NotFoundError( "Reservation Group relation not found");
        return { success: true, reservationGroup: removed };
    }
} as const;
