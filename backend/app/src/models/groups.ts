import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertGroupsSchema = createInsertSchema(table.groups);
export const _selectGroupsSchema = createSelectSchema(table.groups);
const _updateGroupsSchema = createUpdateSchema(table.groups);

// Query Filters
export const groupsQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        search: t.Optional(t.String()), // Fuzzy search on name
    })
]);

// Inserts
export const insertGroupSchema = t.Omit(_insertGroupsSchema, ['id']);

// Attending students that can be written together with a group
const studentFields = t.Object({
    studentIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
});

// Teachers the group is associated with
const teacherFields = t.Object({
    teacherIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
});

export const createGroupSchema = t.Composite([insertGroupSchema, studentFields, teacherFields]);

// Selects
export const selectSimpleGroupSchema = _selectGroupsSchema;

// Updates
export const updateGroupSchema = t.Composite([t.Omit(_updateGroupsSchema, ['id']), studentFields, teacherFields]);

export const patchGroupSchema = t.Composite([
    t.Partial(t.Omit(_updateGroupsSchema, ['id'])),
    studentFields,
    teacherFields,
]);
