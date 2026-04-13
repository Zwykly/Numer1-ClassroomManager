import { NotFoundError } from "elysia";
import { ClassroomReservationsService } from "../services/classroom_reservations";
import { insertClassroomReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema } from "../models/classroom_reservations";

export const ClassroomReservationsController = {
    async getAll({ query }: { query: typeof classroomReservationsQuerySchema.static }) {
        return await ClassroomReservationsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const res = await ClassroomReservationsService.getById(id);
        if (!res) throw new NotFoundError( "Classroom Reservation not found");
        return res;
    },

    async create({ body }: { body: typeof insertClassroomReservationSchema.static }) {
        const created = await ClassroomReservationsService.create(body);
        if (!created) throw new NotFoundError( "Classroom Reservation not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateClassroomReservationSchema.static }) {
        const updated = await ClassroomReservationsService.update(id, body);
        if (!updated) throw new NotFoundError( "Classroom Reservation not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchClassroomReservationSchema.static }) {
        const patched = await ClassroomReservationsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Classroom Reservation not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await ClassroomReservationsService.remove(id);
        if (!removed) throw new NotFoundError( "Classroom Reservation not found");
        return { success: true, reservation: removed };
    }
} as const;