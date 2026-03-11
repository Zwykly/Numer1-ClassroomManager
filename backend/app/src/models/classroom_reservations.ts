import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertClassroomReservationSchema = createInsertSchema(table.classroomReservations, {
    startDate: t.String({ format: 'date-time' }),
    endDate: t.String({ format: 'date-time' }),
    teacherId: t.String({ format: 'uuid', default: '' })
});

const _selectClassroomReservationSchema = createSelectSchema(table.classroomReservations);

const _updateClassroomReservationSchema = createUpdateSchema(table.classroomReservations, {
    startDate: t.String({ format: 'date-time' }),
    endDate: t.String({ format: 'date-time' }),
    teacherId: t.String({ format: 'uuid', default: '' })
});

export const insertClassroomReservationSchema = t.Omit(_insertClassroomReservationSchema, ['id', 'createdOn', 'editedOn']);
export const selectClassroomReservationSchema = _selectClassroomReservationSchema;
export const updateClassroomReservationSchema = t.Omit(_updateClassroomReservationSchema, ['createdOn', 'editedOn']);
export const removeClassroomReservationSchema = t.Omit(_selectClassroomReservationSchema, ['createdOn', 'editedOn', 'startDate', 'endDate', 'teacherId', 'additionalInfo']);