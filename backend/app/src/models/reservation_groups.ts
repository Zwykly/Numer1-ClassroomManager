import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertReservationGroupsSchema = createInsertSchema(table.reservationGroups);
const _selectReservationGroupsSchema = createSelectSchema(table.reservationGroups);
const _updateReservationGroupsSchema = createUpdateSchema(table.reservationGroups);

// Query Filters
export const reservationGroupsQuerySchema = t.Composite([
    paginationQuerySchema,
]);

// Inserts
export const insertReservationGroupSchema = t.Omit(_insertReservationGroupsSchema, ['id']);

// Selects
export const selectSimpleReservationGroupSchema = _selectReservationGroupsSchema;

export const paginatedReservationGroupsResponseSchema = createPaginationResponseSchema(selectSimpleReservationGroupSchema);

// Updates
export const updateReservationGroupSchema = t.Omit(_updateReservationGroupsSchema, ['id']);

export const patchReservationGroupSchema = t.Partial(t.Omit(_updateReservationGroupsSchema, ['id']));
