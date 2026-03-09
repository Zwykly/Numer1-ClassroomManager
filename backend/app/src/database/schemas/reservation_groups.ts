import { pgTable, uuid, varchar, text } from "drizzle-orm/pg-core";
import { classroomReservations } from "./classroom_reservations";
import { groups } from "./groups";

export const reservationGroups = pgTable("reservation_groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name"),
    description: text("description"),
    reservationId: uuid("reservation_id").references(() => classroomReservations.id).notNull(),
    groupId: uuid("group_id").references(() => groups.id).notNull(),
    additionalInfo: text("additional_info"),
});
