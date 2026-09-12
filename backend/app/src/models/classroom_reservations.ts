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
        from: t.Optional(t.String({ format: 'date-time' })),
        to: t.Optional(t.String({ format: 'date-time' })),
        view: t.Optional(t.Union([
            t.Literal('all'),
            t.Literal('recurring'),
            t.Literal('upcoming'),
            t.Literal('archived'),
        ])),
        search: t.Optional(t.String()),
    })
]);

// Inserts
export const insertClassroomReservationSchema = t.Omit(_insertClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']);

// Attending relations that can be written together with a reservation
const attendeeFields = t.Object({
    studentIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
    groupIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
});

export const createClassroomReservationSchema = t.Composite([
    t.Omit(_insertClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']),
    attendeeFields,
]);

// Creates a recurring reservation cycle together with its generated reservations
export const createRecurringReservationSchema = t.Object({
    name: t.String({ minLength: 1 }),
    teacherId: t.Optional(t.String({ format: 'uuid' })),
    classroomId: t.Optional(t.String({ format: 'uuid' })),
    onlineClassroomId: t.Optional(t.String({ format: 'uuid' })),
    additionalInfo: t.Optional(t.Union([t.String(), t.Null()])),
    anchorDate: t.String({ format: 'date-time' }),
    frequency: t.Integer({ minimum: 1 }),
    cycleEndDate: t.Optional(t.String({ format: 'date-time' })),
    numberOfOccurrences: t.Optional(t.Integer({ minimum: 1 })),
    studentIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
    groupIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
});

// Selects
export const selectSimpleClassroomReservationSchema = _selectClassroomReservationsSchema;

// Updates
export const updateClassroomReservationSchema = t.Omit(_updateClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']);

export const patchClassroomReservationSchema = t.Composite([
    t.Partial(t.Omit(_updateClassroomReservationsSchema, ['id', 'createdOn', 'editedOn'])),
    attendeeFields,
]);