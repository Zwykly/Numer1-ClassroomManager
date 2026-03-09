import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { users } from "./users";

export const onlineClassrooms = pgTable("online_classrooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    teacherId: uuid("teacher_id").references(() => users.id).notNull(),
    comment: text("comment"),
    status: varchar("status").notNull(),
});
