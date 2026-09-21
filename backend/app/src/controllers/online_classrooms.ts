import { NotFoundError, status } from "elysia";
import { OnlineClassroomsService } from "../services/online_classrooms";
import { insertOnlineClassroomSchema, updateOnlineClassroomSchema, patchOnlineClassroomSchema, onlineClassroomsQuerySchema } from "../models/online_classrooms";

type AuthUser = {
    userInfo?: { id: string; role?: string | null } | null;
} | null;

function isAdmin(user: AuthUser) {
    return user?.userInfo?.role === "admin";
}

function requireUserId(user: AuthUser) {
    if (!user?.userInfo?.id) throw status(403, "No user profile linked to this session");
    return user.userInfo.id;
}

async function assertOwnership(id: string, user: AuthUser) {
    const ownerId = await OnlineClassroomsService.getOwnerId(id);
    if (!ownerId) throw new NotFoundError("Online Classroom not found");
    if (!isAdmin(user) && ownerId !== requireUserId(user)) {
        throw new NotFoundError("Online Classroom not found");
    }
    return ownerId;
}

export const OnlineClassroomsController = {
    async getAll({ query, user }: { query: typeof onlineClassroomsQuerySchema.static; user: AuthUser }) {
        return await OnlineClassroomsService.getAll(query, {
            id: user?.userInfo?.id,
            isAdmin: isAdmin(user),
        });
    },

    async getById({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        const classroom = await OnlineClassroomsService.getById(id);
        if (!classroom) throw new NotFoundError( "Online Classroom not found");
        if (!isAdmin(user) && classroom.teacherId !== requireUserId(user)) {
            throw new NotFoundError("Online Classroom not found");
        }
        return classroom;
    },

    async create({ body, user }: { body: typeof insertOnlineClassroomSchema.static; user: AuthUser }) {
        const payload = isAdmin(user) ? body : { ...body, teacherId: requireUserId(user) };
        const created = await OnlineClassroomsService.create(payload);
        if (!created) throw new NotFoundError( "Online Classroom not found");
        return created;
    },

    async update({ params: { id }, body, user }: { params: { id: string }; body: typeof updateOnlineClassroomSchema.static; user: AuthUser }) {
        await assertOwnership(id, user);
        const { teacherId, ...rest } = body;
        const updated = await OnlineClassroomsService.update(id, isAdmin(user) ? body : rest);
        if (!updated) throw new NotFoundError( "Online Classroom not found");
        return updated;
    },

    async patch({ params: { id }, body, user }: { params: { id: string }; body: typeof patchOnlineClassroomSchema.static; user: AuthUser }) {
        await assertOwnership(id, user);
        const { teacherId, ...rest } = body;
        const patched = await OnlineClassroomsService.patch(id, isAdmin(user) ? body : rest);
        if (!patched) throw new NotFoundError( "Online Classroom not found");
        return patched;
    },

    async remove({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        await assertOwnership(id, user);
        const removed = await OnlineClassroomsService.remove(id);
        if (!removed) throw new NotFoundError( "Online Classroom not found");
        return { success: true, onlineClassroom: removed };
    }
} as const;
