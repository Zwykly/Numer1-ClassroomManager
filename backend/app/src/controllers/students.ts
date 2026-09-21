import { NotFoundError } from "elysia";
import { StudentsService } from "../services/students";
import { createStudentSchema, insertStudentsBatchSchema, updateStudentSchema, patchStudentSchema, studentsQuerySchema } from "../models/students";

type AuthUser = {
    userInfo?: { id: string; role?: string | null } | null;
} | null;

function isAdmin(user: AuthUser) {
    return user?.userInfo?.role === "admin";
}

export const StudentsController = {
    async getAll({ query, user }: { query: typeof studentsQuerySchema.static; user: AuthUser }) {
        return await StudentsService.getAll(query, {
            id: user?.userInfo?.id,
            isAdmin: isAdmin(user),
        });
    },

    async getById({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        const student = await StudentsService.getById(id, {
            id: user?.userInfo?.id,
            isAdmin: isAdmin(user),
        });
        if (!student) throw new NotFoundError( "Student not found");
        return student;
    },

    async create({ body }: { body: typeof createStudentSchema.static }) {
        const created = await StudentsService.create(body);
        if (!created) throw new NotFoundError( "Student not found");
        return created;
    },

    async createMany({ body }: { body: typeof insertStudentsBatchSchema.static }) {
        return await StudentsService.createMany(body.students);
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
