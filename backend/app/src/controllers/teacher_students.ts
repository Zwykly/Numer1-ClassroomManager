import { NotFoundError } from "elysia";
import { TeacherStudentsService } from "../services/teacher_students";
import { insertTeacherStudentSchema, updateTeacherStudentSchema, patchTeacherStudentSchema, teacherStudentsQuerySchema } from "../models/teacher_students";

export const TeacherStudentsController = {
    async getAll({ query }: { query: typeof teacherStudentsQuerySchema.static }) {
        return await TeacherStudentsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const ts = await TeacherStudentsService.getById(id);
        if (!ts) throw new NotFoundError( "Teacher Student relation not found");
        return ts;
    },

    async create({ body }: { body: typeof insertTeacherStudentSchema.static }) {
        const created = await TeacherStudentsService.create(body);
        if (!created) throw new NotFoundError( "Teacher Student relation not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateTeacherStudentSchema.static }) {
        const updated = await TeacherStudentsService.update(id, body);
        if (!updated) throw new NotFoundError( "Teacher Student relation not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchTeacherStudentSchema.static }) {
        const patched = await TeacherStudentsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Teacher Student relation not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await TeacherStudentsService.remove(id);
        if (!removed) throw new NotFoundError( "Teacher Student relation not found");
        return { success: true, teacherStudent: removed };
    }
} as const;
