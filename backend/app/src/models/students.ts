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

// Teachers that should be associated with the student
const teacherFields = t.Object({
    teacherIds: t.Optional(t.Array(t.String({ format: 'uuid' }))),
});

export const createStudentSchema = t.Composite([insertStudentSchema, teacherFields]);

// Batch inserts
export const insertStudentsBatchSchema = t.Object({
    students: t.Array(createStudentSchema, { minItems: 1 }),
});

// Selects
export const selectSimpleStudentSchema = _selectStudentsSchema;

// Updates
export const updateStudentSchema = t.Composite([t.Omit(_updateStudentsSchema, ['id']), teacherFields]);

export const patchStudentSchema = t.Composite([
    t.Partial(t.Omit(_updateStudentsSchema, ['id'])),
    teacherFields,
]);
