import { NotFoundError, status } from "elysia";
import { GroupsService } from "../services/groups";
import { StudentsService } from "../services/students";
import { createGroupSchema, updateGroupSchema, patchGroupSchema, groupsQuerySchema } from "../models/groups";

type AuthUser = {
    userInfo?: { id: string; role?: string | null } | null;
} | null;

type Viewer = {
    id?: string;
    isAdmin: boolean;
};

function isAdmin(user: AuthUser) {
    return user?.userInfo?.role === "admin";
}

function requireUserId(user: AuthUser) {
    if (!user?.userInfo?.id) throw status(403, "No user profile linked to this session");
    return user.userInfo.id;
}

function toViewer(user: AuthUser): Viewer {
    return { id: user?.userInfo?.id, isAdmin: isAdmin(user) };
}

// A teacher may only attach students that are associated with them.
async function ensureOwnStudents(studentIds: string[] | undefined, user: AuthUser) {
    if (!studentIds || studentIds.length === 0 || isAdmin(user)) return;

    const allowed = new Set(await StudentsService.getTeacherStudentIds(requireUserId(user)));
    const hasForeignStudent = studentIds.some((studentId) => !allowed.has(studentId));
    if (hasForeignStudent) {
        throw status(403, "You can only add your own students to a group");
    }
}

export const GroupsController = {
    async getAll({ query, user }: { query: typeof groupsQuerySchema.static; user: AuthUser }) {
        return await GroupsService.getAll(query, toViewer(user));
    },

    async getById({ params: { id }, user }: { params: { id: string }; user: AuthUser }) {
        const group = await GroupsService.getById(id, toViewer(user));
        if (!group) throw new NotFoundError( "Group not found");
        return group;
    },

    async create({ body, user }: { body: typeof createGroupSchema.static; user: AuthUser }) {
        await ensureOwnStudents(body.studentIds, user);
        const created = await GroupsService.create(body, toViewer(user));
        if (!created) throw new NotFoundError( "Group not found");
        return created;
    },

    async update({ params: { id }, body, user }: { params: { id: string }, body: typeof updateGroupSchema.static; user: AuthUser }) {
        const existing = await GroupsService.getById(id, toViewer(user));
        if (!existing) throw new NotFoundError( "Group not found");
        await ensureOwnStudents(body.studentIds, user);

        const payload = isAdmin(user) ? body : { ...body, teacherIds: undefined };
        const updated = await GroupsService.update(id, payload);
        if (!updated) throw new NotFoundError( "Group not found");
        return updated;
    },

    async patch({ params: { id }, body, user }: { params: { id: string }, body: typeof patchGroupSchema.static; user: AuthUser }) {
        const existing = await GroupsService.getById(id, toViewer(user));
        if (!existing) throw new NotFoundError( "Group not found");
        await ensureOwnStudents(body.studentIds, user);

        const payload = isAdmin(user) ? body : { ...body, teacherIds: undefined };
        const patched = await GroupsService.patch(id, payload);
        if (!patched) throw new NotFoundError( "Group not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removedGroup = await GroupsService.remove(id);
        if (!removedGroup) throw new NotFoundError( "Group not found");
        return { success: true, group: removedGroup };
    }
} as const;
