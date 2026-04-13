import { NotFoundError } from "elysia";
import { ClassroomsService } from "../services/classrooms";
import { insertClassroomSchema, updateClassroomSchema, patchClassroomSchema, classroomsQuerySchema } from "../models/classrooms";

export const ClassroomsController = {
    async getAll({ query }: { query: typeof classroomsQuerySchema.static }) {
        return await ClassroomsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const classroom = await ClassroomsService.getById(id);
        if (!classroom) throw new NotFoundError( "Classroom not found");
        return classroom;
    },

    async create({ body }: { body: typeof insertClassroomSchema.static }) {
        const created = await ClassroomsService.create(body);
        if (!created) throw new NotFoundError( "Classroom not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateClassroomSchema.static }) {
        const updated = await ClassroomsService.update(id, body);
        if (!updated) throw new NotFoundError( "Classroom not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchClassroomSchema.static }) {
        const patched = await ClassroomsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Classroom not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await ClassroomsService.remove(id);
        if (!removed) throw new NotFoundError( "Classroom not found");
        return { success: true, classroom: removed };
    }
} as const;
