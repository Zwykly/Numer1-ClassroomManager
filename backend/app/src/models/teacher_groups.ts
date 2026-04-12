import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertTeacherGroupsSchema = createInsertSchema(table.teacherGroups);
const _selectTeacherGroupsSchema = createSelectSchema(table.teacherGroups);
const _updateTeacherGroupsSchema = createUpdateSchema(table.teacherGroups);

// Query Filters
export const teacherGroupsQuerySchema = t.Composite([
    paginationQuerySchema,
]);

// Inserts
export const insertTeacherGroupSchema = t.Omit(_insertTeacherGroupsSchema, ['id']);

// Selects
export const selectSimpleTeacherGroupSchema = _selectTeacherGroupsSchema;

export const paginatedTeacherGroupsResponseSchema = createPaginationResponseSchema(selectSimpleTeacherGroupSchema);

// Updates
export const updateTeacherGroupSchema = t.Omit(_updateTeacherGroupsSchema, ['id']);

export const patchTeacherGroupSchema = t.Partial(t.Omit(_updateTeacherGroupsSchema, ['id']));
