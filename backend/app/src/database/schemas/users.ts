import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";

export const rolesEnum = pgEnum("roles", ["admin", "teacher"]);

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username").notNull(),
    password: varchar("password").notNull(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    email: varchar("email").notNull(),
    additionalInfo: text("additional_info"),
    role: rolesEnum().default("teacher")
});
