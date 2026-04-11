import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { selectSimpleUserSchema } from './users';


const _insertOnlineClassroomsSchema = createInsertSchema(table.onlineClassrooms);
const _selectOnlineClassroomsSchema = createSelectSchema(table.onlineClassrooms);
const _updateOnlineClassroomsSchema = createUpdateSchema(table.onlineClassrooms);

// Inserts
export const insertOnlineClassroomSchema = t.Omit(_insertOnlineClassroomsSchema, ['id']);

// Selects
export const selectSimpleOnlineClassroomSchema = t.Composite([
    _selectOnlineClassroomsSchema,
    t.Object({
        teacher: selectSimpleUserSchema,
    })
]);

// Updates
export const updateOnlineClassroomSchema = _updateOnlineClassroomsSchema;

// Deletes
export const removeOnlineClassroomSchema = t.Omit(_selectOnlineClassroomsSchema, ['name', 'teacherId', 'comment', 'status']);
