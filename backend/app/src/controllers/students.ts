import { NotFoundError } from "elysia";
import { StudentsService } from "../services/students";
import { insertStudentSchema, updateStudentSchema, patchStudentSchema, studentsQuerySchema } from "../models/students";

export const StudentsController = {
    async getAll({ query }: { query: typeof studentsQuerySchema.static }) {
        return await StudentsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const student = await StudentsService.getById(id);
        if (!student) throw new NotFoundError( "Student not found");
        return student;
    },

    async create({ body }: { body: typeof insertStudentSchema.static }) {
        const created = await StudentsService.create(body);
        if (!created) throw new NotFoundError( "Student not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateStudentSchema.static }) {
        const updated = await StudentsService.update(id, body);
        if (!updated) throw new NotFoundError( "Student not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchStudentSchema.static }) {
        const patched = await StudentsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Student not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removedStudent = await StudentsService.remove(id);
        if (!removedStudent) throw new NotFoundError( "Student not found");
        return { success: true, student: removedStudent };
    }
} as const;
