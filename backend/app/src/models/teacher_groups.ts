import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertTeacherGroupsSchema = createInsertSchema(table.teacherGroups);
const _selectTeacherGroupsSchema = createSelectSchema(table.teacherGroups);
const _updateTeacherGroupsSchema = createUpdateSchema(table.teacherGroups);


// Inserts
export const insertTeacherGroupSchema = t.Omit(_insertTeacherGroupsSchema, ['id']);

// Selects
export const selectTeacherGroupSchema = _selectTeacherGroupsSchema;

// Updates
export const updateTeacherGroupSchema = _updateTeacherGroupsSchema;

// Deletes
export const removeTeacherGroupSchema = t.Omit(_selectTeacherGroupsSchema, ['groupId', 'teacherId']);
