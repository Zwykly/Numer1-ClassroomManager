import { pgTable, uuid } from "drizzle-orm/pg-core";
import { groups } from "./groups";
import { users } from "./users";

export const teacherGroups = pgTable("teacher_groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").references(() => groups.id).unique().notNull(),
    teacherId: uuid("teacher_id").references(() => users.id).notNull(),
});
