import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertStudentsSchema = createInsertSchema(table.students);
const _selectStudentsSchema = createSelectSchema(table.students);
const _updateStudentsSchema = createUpdateSchema(table.students);

export const insertStudentSchema = t.Omit(_insertStudentsSchema, ['id']);
export const selectStudentSchema = _selectStudentsSchema;
export const updateStudentSchema = _updateStudentsSchema;
export const removeStudentSchema = t.Omit(_selectStudentsSchema, ['firstName', 'lastName', 'phoneNumber', 'email', 'additionalInfo']);
