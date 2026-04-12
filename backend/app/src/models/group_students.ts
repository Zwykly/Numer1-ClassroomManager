import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertGroupStudentsSchema = createInsertSchema(table.groupStudents);
const _selectGroupStudentsSchema = createSelectSchema(table.groupStudents);
const _updateGroupStudentsSchema = createUpdateSchema(table.groupStudents);

// Query Filters
export const groupStudentsQuerySchema = t.Composite([
    paginationQuerySchema,
]);

// Inserts
export const insertGroupStudentSchema = t.Omit(_insertGroupStudentsSchema, ['id']);

// Selects
export const selectSimpleGroupStudentSchema = _selectGroupStudentsSchema;

export const paginatedGroupStudentsResponseSchema = createPaginationResponseSchema(selectSimpleGroupStudentSchema);

// Updates
export const updateGroupStudentSchema = t.Omit(_updateGroupStudentsSchema, ['id']);

export const patchGroupStudentSchema = t.Partial(t.Omit(_updateGroupStudentsSchema, ['id']));
