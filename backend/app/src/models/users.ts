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
        search: t.Optional(t.String()), // Fuzzy search on first name, last name and email
    })
]);

// Inserts
export const insertUserSchema = t.Omit(_insertUsersSchema, ['id']);

// Account creation (creates the auth account together with the business user)
export const createUserAccountSchema = t.Object({
    firstName: t.String({ minLength: 1 }),
    lastName: t.String({ minLength: 1 }),
    email: t.String({ format: 'email' }),
    role: t.Union([t.Literal('admin'), t.Literal('teacher')]),
    additionalInfo: t.Optional(t.Nullable(t.String())),
    password: t.Optional(t.String({ minLength: 8 })),
});

// Selects
export const selectSimpleUserSchema = t.Omit(_selectUsersSchema,
    ['authId', 'email', 'additionalInfo', 'role']
);

// Updates
export const updateUserSchema = t.Omit(_updateUsersSchema, ['id']);

export const patchUserSchema = t.Partial(t.Omit(_updateUsersSchema, ['id']));