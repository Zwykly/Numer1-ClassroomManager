import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertOnlineClassroomsSchema = createInsertSchema(table.onlineClassrooms, {
    teacherId: t.String({ format: 'uuid', default: '' })
});
const _selectOnlineClassroomsSchema = createSelectSchema(table.onlineClassrooms);
const _updateOnlineClassroomsSchema = createUpdateSchema(table.onlineClassrooms, {
    teacherId: t.String({ format: 'uuid', default: '' })
});

export const insertOnlineClassroomSchema = t.Omit(_insertOnlineClassroomsSchema, ['id']);
export const selectOnlineClassroomSchema = _selectOnlineClassroomsSchema;
export const updateOnlineClassroomSchema = _updateOnlineClassroomsSchema;
export const removeOnlineClassroomSchema = t.Omit(_selectOnlineClassroomsSchema, ['name', 'teacherId', 'comment', 'status']);
