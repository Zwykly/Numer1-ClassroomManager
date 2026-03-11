import { pgTable, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';

export const authUsers = pgTable('auth_users', {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
});

export const authSessions = pgTable('auth_sessions', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => authUsers.id),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
});

export const authAccounts = pgTable('auth_accounts', {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().references(() => authUsers.id),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    password: text('password'),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
});

export const authVerification = pgTable("auth_verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow(),
});