import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { paginationQuerySchema, createPaginationResponseSchema, createFilterArraySchema } from './common';

const _insertUsersSchema = createInsertSchema(table.users);
export const _selectUsersSchema = createSelectSchema(table.users);
const _updateUsersSchema = createUpdateSchema(table.users);

// Query Filters
export const usersQuerySchema = t.Composite([
    paginationQuerySchema,
    t.Object({
        role: createFilterArraySchema(),
    })
]);

// Inserts
export const insertUserSchema = t.Omit(_insertUsersSchema, ['id']);

// Selects
export const selectSimpleUserSchema = t.Omit(_selectUsersSchema,
    ['authId', 'email', 'additionalInfo', 'role']
);

// Updates
export const updateUserSchema = t.Omit(_updateUsersSchema, ['id']);

export const patchUserSchema = t.Partial(t.Omit(_updateUsersSchema, ['id']));