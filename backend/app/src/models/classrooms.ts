import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { selectSimpleClassroomReservationSchema } from './classroom_reservations';
import { selectSimpleUserSchema } from './users';

const _insertClassroomsSchema = createInsertSchema(table.classrooms);
const _selectClassroomsSchema = createSelectSchema(table.classrooms);
const _updateClassroomsSchema = createUpdateSchema(table.classrooms);


// Inserts
export const insertClassroomSchema = t.Omit(_insertClassroomsSchema, ['id']);

// Selects
export const selectSimpleClassroomSchema = t.Composite([
    _selectClassroomsSchema,
    t.Object({
        teacher: selectSimpleUserSchema,
    })
]);

export const selectCompositeClassroomSchema = t.Composite([
    _selectClassroomsSchema,
    t.Object({
        reservations: t.Array(selectSimpleClassroomReservationSchema)
    })
]);

// Updates
export const updateClassroomSchema = _updateClassroomsSchema;

// Deletes
export const removeClassroomSchema = t.Omit(_selectClassroomsSchema, ['name', 'maxNumberOfPeople', 'additionalInfo', 'status']);
