import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { selectSimpleUserSchema } from './users';
import { selectSimpleClassroomSchema } from './classrooms';

const _insertClassroomReservationSchema = createInsertSchema(table.classroomReservations);

const _selectClassroomReservationSchema = createSelectSchema(table.classroomReservations);

const _updateClassroomReservationSchema = createUpdateSchema(table.classroomReservations);


// Inserts
export const insertClassroomReservationSchema = t.Omit(_insertClassroomReservationSchema, ['id', 'createdOn', 'editedOn']);

// Selects
export const selectSimpleClassroomReservationSchema = _selectClassroomReservationSchema;

export const selectCompositeClassroomReservationSchema = t.Composite([
    _selectClassroomReservationSchema,
    t.Object({
        teacher: selectSimpleUserSchema,
        classroom: selectSimpleClassroomSchema
    })
]);

// Updates
export const updateClassroomReservationSchema = t.Omit(_updateClassroomReservationSchema, ['createdOn', 'editedOn']);

// Deletes
export const removeClassroomReservationSchema = t.Omit(_selectClassroomReservationSchema, ['createdOn', 'editedOn', 'startDate', 'endDate', 'teacherId', 'additionalInfo']);