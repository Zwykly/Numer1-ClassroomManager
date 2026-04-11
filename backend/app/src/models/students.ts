import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { selectSimpleGroupSchema } from './groups';

const _insertStudentsSchema = createInsertSchema(table.students);
const _selectStudentsSchema = createSelectSchema(table.students);
const _updateStudentsSchema = createUpdateSchema(table.students);

// Inserts
export const insertStudentSchema = t.Omit(_insertStudentsSchema, ['id']);

// Select
export const selectSimpleStudentSchema = t.Omit(_selectStudentsSchema,
    ['phoneNumber', 'email', 'additionalInfo']
);
export const selectCompositeStudentSchema = t.Composite([
    t.Object(_selectStudentsSchema),
    t.Object({
        groups: t.Array(selectSimpleGroupSchema)
    })
]);

// Updates
export const updateStudentSchema = _updateStudentsSchema;

// Deletes
export const removeStudentSchema = t.Omit(_selectStudentsSchema, ['firstName', 'lastName', 'phoneNumber', 'email', 'additionalInfo']);
