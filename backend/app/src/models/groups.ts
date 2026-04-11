import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { selectSimpleStudentSchema } from './students';
import { selectSimpleUserSchema } from './users';

const _insertGroupsSchema = createInsertSchema(table.groups);
const _selectGroupsSchema = createSelectSchema(table.groups);
const _updateGroupsSchema = createUpdateSchema(table.groups);

// Inserts
export const insertGroupSchema = t.Omit(_insertGroupsSchema, ['id']);

// Selects
export const selectSimpleGroupSchema = _selectGroupsSchema;

export const selectCompositeGroupSchema = t.Composite([
    t.Object(_selectGroupsSchema),
    t.Object({
        students: t.Array(selectSimpleStudentSchema),
        teachers: t.Array(selectSimpleUserSchema)
    })
]);

// Updates
export const updateGroupSchema = _updateGroupsSchema;

// Deletes
export const removeGroupSchema = t.Omit(_selectGroupsSchema, ['name', 'description']);
