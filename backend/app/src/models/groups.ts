import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertGroupsSchema = createInsertSchema(table.groups);
const _selectGroupsSchema = createSelectSchema(table.groups);
const _updateGroupsSchema = createUpdateSchema(table.groups);

export const insertGroupSchema = t.Omit(_insertGroupsSchema, ['id']);
export const selectGroupSchema = _selectGroupsSchema;
export const updateGroupSchema = _updateGroupsSchema;
export const removeGroupSchema = t.Omit(_selectGroupsSchema, ['name', 'description']);
