import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema, createFilterArraySchema } from './common';

const _insertClassroomsSchema = createInsertSchema(table.classrooms);
export const _selectClassroomsSchema = createSelectSchema(table.classrooms);
const _updateClassroomsSchema = createUpdateSchema(table.classrooms);

// Query Filters
export const classroomsQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        status: createFilterArraySchema(),
    })
]);

// Inserts
export const insertClassroomSchema = t.Omit(_insertClassroomsSchema, ['id']);

// Selects
export const selectSimpleClassroomSchema = _selectClassroomsSchema;

// Updates
export const updateClassroomSchema = t.Omit(_updateClassroomsSchema, ['id']);

export const patchClassroomSchema = t.Partial(t.Omit(_updateClassroomsSchema, ['id']));
