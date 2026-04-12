import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema, createFilterArraySchema } from './common';

const _insertReservationCyclesSchema = createInsertSchema(table.reservationCycles);
export const _selectReservationCyclesSchema = createSelectSchema(table.reservationCycles);
const _updateReservationCyclesSchema = createUpdateSchema(table.reservationCycles);

// Query Filters
export const reservationCyclesQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        status: createFilterArraySchema(),
    })
]);

// Inserts
export const insertReservationCycleSchema = t.Omit(_insertReservationCyclesSchema, ['id', 'createdOn']);

// Selects
export const selectSimpleReservationCycleSchema = _selectReservationCyclesSchema;

// Updates
export const updateReservationCycleSchema = t.Omit(_updateReservationCyclesSchema, ['id', 'createdOn']);

export const patchReservationCycleSchema = t.Partial(t.Omit(_updateReservationCyclesSchema, ['id', 'createdOn']));
