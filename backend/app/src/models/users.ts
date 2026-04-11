import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { role } from 'better-auth/plugins';
import { selectSimpleOnlineClassroomSchema } from './online_classrooms';
import { selectSimpleGroupSchema } from './groups';
import { selectSimpleClassroomReservationSchema } from './classroom_reservations';

const _insertUsersSchema = createInsertSchema(table.users);
const _selectUsersSchema = createSelectSchema(table.users);
const _updateUsersSchema = createUpdateSchema(table.users);

// Inserts
export const insertUserSchema = t.Omit(_insertUsersSchema, ['id']);

// Selects
export const selectSimpleUserSchema = t.Omit(_selectUsersSchema,
    ['authId', 'email', 'additionalInfo', 'role']
)

export const selectCompositeUserSchema = t.Composite([
    t.Omit(_selectUsersSchema, ['authId']),
    t.Object({
        groups: t.Array(selectSimpleGroupSchema),
        reservations: t.Array(selectSimpleClassroomReservationSchema),
        onlineClassroom: selectSimpleOnlineClassroomSchema
    })
]);


// Updates
export const updateUserSchema = _updateUsersSchema;

// Deletes
export const removeUserSchema = t.Omit(_selectUsersSchema, ['username', 'password', 'firstName', 'lastName', 'email', 'additionalInfo', 'role']);