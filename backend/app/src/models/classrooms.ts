import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertClassroomsSchema = createInsertSchema(table.classrooms);
const _selectClassroomsSchema = createSelectSchema(table.classrooms);
const _updateClassroomsSchema = createUpdateSchema(table.classrooms);

export const insertClassroomSchema = t.Omit(_insertClassroomsSchema, ['id']);
export const selectClassroomSchema = _selectClassroomsSchema;
export const updateClassroomSchema = _updateClassroomsSchema;
export const removeClassroomSchema = t.Omit(_selectClassroomsSchema, ['name', 'maxNumberOfPeople', 'additionalInfo', 'status']);
