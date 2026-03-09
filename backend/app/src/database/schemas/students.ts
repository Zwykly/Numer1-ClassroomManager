import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";

export const students = pgTable("students", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    phoneNumber: varchar("phone_number"),
    email: varchar("email"),
    additionalInfo: text("additional_info"),
});
