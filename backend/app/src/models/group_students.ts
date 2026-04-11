import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertGroupStudentsSchema = createInsertSchema(table.groupStudents);
const _selectGroupStudentsSchema = createSelectSchema(table.groupStudents);
const _updateGroupStudentsSchema = createUpdateSchema(table.groupStudents);

// Inserts
export const insertGroupStudentSchema = t.Omit(_insertGroupStudentsSchema, ['id']);

// Selects
export const selectGroupStudentSchema = _selectGroupStudentsSchema;

// Updates
export const updateGroupStudentSchema = _updateGroupStudentsSchema;

// Deletes
export const removeGroupStudentSchema = t.Omit(_selectGroupStudentsSchema, ['groupId', 'studentId']);
