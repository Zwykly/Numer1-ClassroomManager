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
    durationMinutes: t.Optional(t.Integer({ minimum: 1 })),
    frequency: t.Integer({ minimum: 1 }),
    cycleEndDate: t.Optional(t.String({ format: 'date-time' })),
    numberOfOccurrences: t.Optional(t.Integer({ minimum: 1 })),
    occurrenceOverrides: t.Optional(t.Array(t.Object({
        index: t.Integer({ minimum: 0 }),
        reservationTime: t.String({ format: 'date-time' }),
    }))),
    studentIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
    groupIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
});

// Conflict detection
const recurrenceInputSchema = t.Object({
    anchorDate: t.String({ format: 'date-time' }),
    frequency: t.Integer({ minimum: 1 }),
    cycleEndDate: t.Optional(t.String({ format: 'date-time' })),
    numberOfOccurrences: t.Optional(t.Integer({ minimum: 1 })),
    overrides: t.Optional(t.Array(t.Object({
        index: t.Integer({ minimum: 0 }),
        reservationTime: t.String({ format: 'date-time' }),
    }))),
});

export const checkConflictsSchema = t.Object({
    teacherId: t.Optional(t.String({ format: 'uuid' })),
    classroomId: t.Optional(t.Union([t.String({ format: 'uuid' }), t.Null()])),
    onlineClassroomId: t.Optional(t.Union([t.String({ format: 'uuid' }), t.Null()])),
    durationMinutes: t.Optional(t.Union([t.Integer({ minimum: 1 }), t.Null()])),
    reservationTime: t.Optional(t.String({ format: 'date-time' })),
    recurrence: t.Optional(recurrenceInputSchema),
    excludeId: t.Optional(t.String({ format: 'uuid' })),
});

const conflictItemSchema = t.Object({
    type: t.Union([t.Literal('room'), t.Literal('teacher')]),
    reservationId: t.String(),
    name: t.Union([t.String(), t.Null()]),
    reservationTime: t.String({ format: 'date-time' }),
    durationMinutes: t.Union([t.Integer(), t.Null()]),
    teacherName: t.Union([t.String(), t.Null()]),
    roomName: t.Union([t.String(), t.Null()]),
});

export const conflictResultSchema = t.Object({
    conflicts: t.Array(t.Object({
        index: t.Integer(),
        reservationTime: t.String({ format: 'date-time' }),
        items: t.Array(conflictItemSchema),
        suggestion: t.Optional(t.String({ format: 'date-time' })),
    })),
    allConflicted: t.Optional(t.Boolean()),
    suggestedAnchor: t.Optional(t.String({ format: 'date-time' })),
});


// Selects
export const selectSimpleClassroomReservationSchema = _selectClassroomReservationsSchema;

// Updates
export const updateClassroomReservationSchema = t.Omit(_updateClassroomReservationsSchema, ['id', 'createdOn', 'editedOn']);

export const patchClassroomReservationSchema = t.Composite([
    t.Partial(t.Omit(_updateClassroomReservationsSchema, ['id', 'createdOn', 'editedOn'])),
    attendeeFields,
]);