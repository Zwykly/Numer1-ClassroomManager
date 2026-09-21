import { NotFoundError } from "elysia";
import { ReservationStudentsService } from "../services/reservation_students";
import { insertReservationStudentSchema, updateReservationStudentSchema, patchReservationStudentSchema, reservationStudentsQuerySchema } from "../models/reservation_students";

export const ReservationStudentsController = {
    async getAll({ query }: { query: typeof reservationStudentsQuerySchema.static }) {
        return await ReservationStudentsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const rs = await ReservationStudentsService.getById(id);
        if (!rs) throw new NotFoundError( "Reservation Student relation not found");
        return rs;
    },

    async create({ body }: { body: typeof insertReservationStudentSchema.static }) {
        const created = await ReservationStudentsService.create(body);
        if (!created) throw new NotFoundError( "Reservation Student relation not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateReservationStudentSchema.static }) {
        const updated = await ReservationStudentsService.update(id, body);
        if (!updated) throw new NotFoundError( "Reservation Student relation not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchReservationStudentSchema.static }) {
        const patched = await ReservationStudentsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Reservation Student relation not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await ReservationStudentsService.remove(id);
        if (!removed) throw new NotFoundError( "Reservation Student relation not found");
        return { success: true, reservationStudent: removed };
    }
} as const;
