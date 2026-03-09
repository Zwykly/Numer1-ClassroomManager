import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";

export const groups = pgTable("groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    description: text("description"),
});
