import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertTeacherStudentsSchema = createInsertSchema(table.teacherStudents);
const _selectTeacherStudentsSchema = createSelectSchema(table.teacherStudents);
const _updateTeacherStudentsSchema = createUpdateSchema(table.teacherStudents);

// Query Filters
export const teacherStudentsQuerySchema = t.Composite([
    paginationQuerySchema,
]);

// Inserts
export const insertTeacherStudentSchema = t.Omit(_insertTeacherStudentsSchema, ['id']);

// Selects
export const selectSimpleTeacherStudentSchema = _selectTeacherStudentsSchema;

export const paginatedTeacherStudentsResponseSchema = createPaginationResponseSchema(selectSimpleTeacherStudentSchema);

// Updates
export const updateTeacherStudentSchema = t.Omit(_updateTeacherStudentsSchema, ['id']);

export const patchTeacherStudentSchema = t.Partial(t.Omit(_updateTeacherStudentsSchema, ['id']));
