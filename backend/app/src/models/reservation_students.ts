import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertReservationStudentsSchema = createInsertSchema(table.reservationStudents, {
    reservationId: t.String({ format: 'uuid', default: '' }),
    studentId: t.String({ format: 'uuid', default: '' })
});
const _selectReservationStudentsSchema = createSelectSchema(table.reservationStudents);
const _updateReservationStudentsSchema = createUpdateSchema(table.reservationStudents, {
    reservationId: t.String({ format: 'uuid', default: '' }),
    studentId: t.String({ format: 'uuid', default: '' })
});

export const insertReservationStudentSchema = t.Omit(_insertReservationStudentsSchema, ['id']);
export const selectReservationStudentSchema = _selectReservationStudentsSchema;
export const updateReservationStudentSchema = _updateReservationStudentsSchema;
export const removeReservationStudentSchema = t.Omit(_selectReservationStudentsSchema, ['reservationId', 'studentId', 'additionalInfo']);
