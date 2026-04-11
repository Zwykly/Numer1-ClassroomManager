import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertReservationStudentsSchema = createInsertSchema(table.reservationStudents);
const _selectReservationStudentsSchema = createSelectSchema(table.reservationStudents);
const _updateReservationStudentsSchema = createUpdateSchema(table.reservationStudents);


// Inserts
export const insertReservationStudentSchema = t.Omit(_insertReservationStudentsSchema, ['id']);

// Selects
export const selectReservationStudentSchema = _selectReservationStudentsSchema;

// Updates
export const updateReservationStudentSchema = _updateReservationStudentsSchema;

// Deletes
export const removeReservationStudentSchema = t.Omit(_selectReservationStudentsSchema, ['reservationId', 'studentId', 'additionalInfo']);
