import { NotFoundError } from "elysia";
import { GroupsService } from "../services/groups";
import { insertGroupSchema, updateGroupSchema, patchGroupSchema, groupsQuerySchema } from "../models/groups";

export const GroupsController = {
    async getAll({ query }: { query: typeof groupsQuerySchema.static }) {
        return await GroupsService.getAll(query);
    },

    async getById({ params: { id } }: { params: { id: string } }) {
        const group = await GroupsService.getById(id);
        if (!group) throw new NotFoundError( "Group not found");
        return group;
    },

    async create({ body }: { body: typeof insertGroupSchema.static }) {
        const created = await GroupsService.create(body);
        if (!created) throw new NotFoundError( "Group not found");
        return created;
    },

    async update({ params: { id }, body }: { params: { id: string }, body: typeof updateGroupSchema.static }) {
        const updated = await GroupsService.update(id, body);
        if (!updated) throw new NotFoundError( "Group not found");
        return updated;
    },

    async patch({ params: { id }, body }: { params: { id: string }, body: typeof patchGroupSchema.static }) {
        const patched = await GroupsService.patch(id, body);
        if (!patched) throw new NotFoundError( "Group not found");
        return patched;
    },

    async remove({ params: { id } }: { params: { id: string } }) {
        const removedGroup = await GroupsService.remove(id);
        if (!removedGroup) throw new NotFoundError( "Group not found");
        return { success: true, group: removedGroup };
    }
} as const;
