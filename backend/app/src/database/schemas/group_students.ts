import { pgTable, uuid } from "drizzle-orm/pg-core";
import { groups } from "./groups";
import { students } from "./students";

export const groupStudents = pgTable("group_students", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").references(() => groups.id).notNull(),
    studentId: uuid("student_id").references(() => students.id).notNull(),
});
