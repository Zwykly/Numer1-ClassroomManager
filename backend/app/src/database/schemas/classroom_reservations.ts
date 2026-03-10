import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";
import { users } from "./users";

export const classroomReservations = pgTable("classroom_reservations", {
    id: uuid("id").primaryKey().defaultRandom(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    teacherId: uuid("teacher_id").references(() => users.id).notNull(),
    additionalInfo: text("additional_info"),
    createdOn: timestamp("created_on").defaultNow().notNull(),
    editedOn: timestamp("edited_on").defaultNow().notNull(),
});

export const table = {
    classroomReservations
} as const;

export type table = typeof table;