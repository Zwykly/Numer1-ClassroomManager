import { NotFoundError } from "elysia";
import { GroupStudentsService } from "../services/group_students";
import { insertGroupStudentSchema, updateGroupStudentSchema, patchGroupStudentSchema, groupStudentsQuerySchema } from "../models/group_students";

export const GroupStudentsController = {
    async getAll({ query }: { query: typeof groupStudentsQuerySchema.static }) {
        return await GroupStudentsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const gs = await GroupStudentsService.getById(id);
        if (!gs) throw new NotFoundError( "Group Student relation not found");
        return gs;
    },

    async create({ body }: { body: typeof insertGroupStudentSchema.static }) {
        const created = await GroupStudentsService.create(body);
        if (!created) throw new NotFoundError( "Group Student relation not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateGroupStudentSchema.static }) {
        const updated = await GroupStudentsService.update(id, body);
        if (!updated) throw new NotFoundError( "Group Student relation not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchGroupStudentSchema.static }) {
        const patched = await GroupStudentsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Group Student relation not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await GroupStudentsService.remove(id);
        if (!removed) throw new NotFoundError( "Group Student relation not found");
        return { success: true, groupStudent: removed };
    }
} as const;
