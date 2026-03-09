import { pgTable, uuid, text } from "drizzle-orm/pg-core";
import { classroomReservations } from "./classroom_reservations";
import { students } from "./students";

export const reservationStudents = pgTable("reservation_students", {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id").references(() => classroomReservations.id).notNull(),
    studentId: uuid("student_id").references(() => students.id).notNull(),
    additionalInfo: text("additional_info"),
});
