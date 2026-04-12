import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertReservationStudentsSchema = createInsertSchema(table.reservationStudents);
const _selectReservationStudentsSchema = createSelectSchema(table.reservationStudents);
const _updateReservationStudentsSchema = createUpdateSchema(table.reservationStudents);

// Query Filters
export const reservationStudentsQuerySchema = t.Composite([
    paginationQuerySchema,
]);

// Inserts
export const insertReservationStudentSchema = t.Omit(_insertReservationStudentsSchema, ['id']);

// Selects
export const selectSimpleReservationStudentSchema = _selectReservationStudentsSchema;

export const paginatedReservationStudentsResponseSchema = createPaginationResponseSchema(selectSimpleReservationStudentSchema);

// Updates
export const updateReservationStudentSchema = t.Omit(_updateReservationStudentsSchema, ['id']);

export const patchReservationStudentSchema = t.Partial(t.Omit(_updateReservationStudentsSchema, ['id']));
