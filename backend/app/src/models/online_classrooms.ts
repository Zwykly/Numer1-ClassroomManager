import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema, createFilterArraySchema } from './common';

const _insertOnlineClassroomsSchema = createInsertSchema(table.onlineClassrooms);
export const _selectOnlineClassroomsSchema = createSelectSchema(table.onlineClassrooms);
const _updateOnlineClassroomsSchema = createUpdateSchema(table.onlineClassrooms);

// Query Filters
export const onlineClassroomsQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        status: createFilterArraySchema(),
    })
]);

// Inserts
export const insertOnlineClassroomSchema = t.Omit(_insertOnlineClassroomsSchema, ['id']);

// Selects
export const selectSimpleOnlineClassroomSchema = _selectOnlineClassroomsSchema;

// Updates
export const updateOnlineClassroomSchema = t.Omit(_updateOnlineClassroomsSchema, ['id']);

export const patchOnlineClassroomSchema = t.Partial(t.Omit(_updateOnlineClassroomsSchema, ['id']));
