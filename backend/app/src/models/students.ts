import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema } from './common';

const _insertStudentsSchema = createInsertSchema(table.students);
export const _selectStudentsSchema = createSelectSchema(table.students);
const _updateStudentsSchema = createUpdateSchema(table.students);

// Query Filters
export const studentsQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        search: t.Optional(t.String()), // Fuzzy search on first and last name
    })
]);

// Inserts
export const insertStudentSchema = t.Omit(_insertStudentsSchema, ['id']);

// Batch inserts
export const insertStudentsBatchSchema = t.Object({
    students: t.Array(insertStudentSchema, { minItems: 1 }),
});

// Selects
export const selectSimpleStudentSchema = _selectStudentsSchema;

// Updates
export const updateStudentSchema = t.Omit(_updateStudentsSchema, ['id']);

export const patchStudentSchema = t.Partial(t.Omit(_updateStudentsSchema, ['id']));
