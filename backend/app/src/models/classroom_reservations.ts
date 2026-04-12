import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema, createFilterArraySchema } from './common';

const _insertClassroomReservationsSchema = createInsertSchema(table.classroomReservations);
export const _selectClassroomReservationsSchema = createSelectSchema(table.classroomReservations);
const _updateClassroomReservationsSchema = createUpdateSchema(table.classroomReservations);

// Query Filters
export const classroomReservationsQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        status: createFilterArraySchema(),
    })
]);

// Inserts
export const insertClassroomReservationSchema = t.Omit(_insertClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']);

// Selects
export const selectSimpleClassroomReservationSchema = _selectClassroomReservationsSchema;

// Updates
export const updateClassroomReservationSchema = t.Omit(_updateClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']);

export const patchClassroomReservationSchema = t.Partial(t.Omit(_updateClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']));