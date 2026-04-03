import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertUsersSchema = createInsertSchema(table.users);
const _selectUsersSchema = createSelectSchema(table.users);
const _updateUsersSchema = createUpdateSchema(table.users);


export const insertUserSchema = t.Omit(_insertUsersSchema, ['id']);
export const selectUserSchema = t.Omit(_selectUsersSchema, ['password']);
export const updateUserSchema = _updateUsersSchema;
export const removeUserSchema = t.Omit(_selectUsersSchema, ['username', 'password', 'firstName', 'lastName', 'email', 'additionalInfo', 'role']);
export const loginRequestUsersSchema = t.Omit(_selectUsersSchema, ['id', 'firstName', 'lastName', 'email', 'additionalInfo', 'role']);
export const loginResponseUsersSchema =
    t.Object({
        user:t.Optional(_selectUsersSchema),
        success: t.Boolean(),
        message: t.String(),
    });