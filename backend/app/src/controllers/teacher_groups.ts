import { NotFoundError } from "elysia";
import { TeacherGroupsService } from "../services/teacher_groups";
import { insertTeacherGroupSchema, updateTeacherGroupSchema, patchTeacherGroupSchema, teacherGroupsQuerySchema } from "../models/teacher_groups";

export const TeacherGroupsController = {
    async getAll({ query }: { query: typeof teacherGroupsQuerySchema.static }) {
        return await TeacherGroupsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const tg = await TeacherGroupsService.getById(id);
        if (!tg) throw new NotFoundError( "Teacher Group relation not found");
        return tg;
    },

    async create({ body }: { body: typeof insertTeacherGroupSchema.static }) {
        const created = await TeacherGroupsService.create(body);
        if (!created) throw new NotFoundError( "Teacher Group relation not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateTeacherGroupSchema.static }) {
        const updated = await TeacherGroupsService.update(id, body);
        if (!updated) throw new NotFoundError( "Teacher Group relation not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchTeacherGroupSchema.static }) {
        const patched = await TeacherGroupsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Teacher Group relation not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await TeacherGroupsService.remove(id);
        if (!removed) throw new NotFoundError( "Teacher Group relation not found");
        return { success: true, teacherGroup: removed };
    }
} as const;
