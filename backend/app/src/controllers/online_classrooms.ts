import { NotFoundError } from "elysia";
import { OnlineClassroomsService } from "../services/online_classrooms";
import { insertOnlineClassroomSchema, updateOnlineClassroomSchema, patchOnlineClassroomSchema, onlineClassroomsQuerySchema } from "../models/online_classrooms";

export const OnlineClassroomsController = {
    async getAll({ query }: { query: typeof onlineClassroomsQuerySchema.static }) {
        return await OnlineClassroomsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const classroom = await OnlineClassroomsService.getById(id);
        if (!classroom) throw new NotFoundError( "Online Classroom not found");
        return classroom;
    },

    async create({ body }: { body: typeof insertOnlineClassroomSchema.static }) {
        const created = await OnlineClassroomsService.create(body);
        if (!created) throw new NotFoundError( "Online Classroom not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateOnlineClassroomSchema.static }) {
        const updated = await OnlineClassroomsService.update(id, body);
        if (!updated) throw new NotFoundError( "Online Classroom not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchOnlineClassroomSchema.static }) {
        const patched = await OnlineClassroomsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Online Classroom not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await OnlineClassroomsService.remove(id);
        if (!removed) throw new NotFoundError( "Online Classroom not found");
        return { success: true, onlineClassroom: removed };
    }
} as const;
