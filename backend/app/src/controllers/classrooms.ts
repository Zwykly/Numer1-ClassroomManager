import { NotFoundError, status } from "elysia";
import { ClassroomsService } from "../services/classrooms";
import { insertClassroomSchema, updateClassroomSchema, patchClassroomSchema, classroomsQuerySchema } from "../models/classrooms";

const DUPLICATE_NAME_MESSAGE = "A classroom with this name already exists.";

function isUniqueViolation(error: unknown): boolean {
    return typeof error === "object" && error !== null && (error as { code?: string }).code === "23505";
}

async function ensureNameAvailable(name: string | null | undefined, ignoreId?: string) {
    if (!name) return;
    const existing = await ClassroomsService.getByName(name);
    if (existing && existing.id !== ignoreId) {
        throw status(409, DUPLICATE_NAME_MESSAGE);
    }
}

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
        await ensureNameAvailable(body.name);
        try {
            const created = await ClassroomsService.create(body);
            if (!created) throw new NotFoundError( "Classroom not found");
            return created;
        } catch (error) {
            if (isUniqueViolation(error)) throw status(409, DUPLICATE_NAME_MESSAGE);
            throw error;
        }
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateClassroomSchema.static }) {
        await ensureNameAvailable(body.name, id);
        try {
            const updated = await ClassroomsService.update(id, body);
            if (!updated) throw new NotFoundError( "Classroom not found");
            return updated;
        } catch (error) {
            if (isUniqueViolation(error)) throw status(409, DUPLICATE_NAME_MESSAGE);
            throw error;
        }
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchClassroomSchema.static }) {
        await ensureNameAvailable(body.name, id);
        try {
            const patched = await ClassroomsService.patch(id, body);
            if (!patched) throw new NotFoundError( "Classroom not found");
            return patched;
        } catch (error) {
            if (isUniqueViolation(error)) throw status(409, DUPLICATE_NAME_MESSAGE);
            throw error;
        }
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removed = await ClassroomsService.remove(id);
        if (!removed) throw new NotFoundError( "Classroom not found");
        return { success: true, classroom: removed };
    }
} as const;
