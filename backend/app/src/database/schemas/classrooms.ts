import { pgTable, uuid, varchar, integer, text } from "drizzle-orm/pg-core";

export const classrooms = pgTable("classrooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    maxNumberOfPeople: integer("max_number_of_people").notNull(),
    additionalInfo: text("additional_info"),
    status: varchar("status").notNull(),
});
