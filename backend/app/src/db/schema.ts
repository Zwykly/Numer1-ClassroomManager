import { pgTable, uuid, timestamp, text, varchar, integer, pgEnum } from "drizzle-orm/pg-core";

export const classroomReservations = pgTable("classroom_reservations", {
    id: uuid("id").primaryKey().defaultRandom(),
    startDate: timestamp("start_date").notNull(),
    endDate: timestamp("end_date").notNull(),
    teacherId: uuid("teacher_id").references(() => users.id).notNull(),
    additionalInfo: text("additional_info"),
    createdOn: timestamp("created_on").defaultNow().notNull(),
    editedOn: timestamp("edited_on").defaultNow().notNull(),
});

export const classrooms = pgTable("classrooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    maxNumberOfPeople: integer("max_number_of_people").notNull(),
    additionalInfo: text("additional_info"),
    status: varchar("status").notNull(),
});

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

export const groupStudents = pgTable("group_students", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").references(() => groups.id).notNull(),
    studentId: uuid("student_id").references(() => students.id).notNull(),
});

export const groups = pgTable("groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    description: text("description"),
});

export const onlineClassrooms = pgTable("online_classrooms", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name").notNull(),
    teacherId: uuid("teacher_id").references(() => users.id).notNull(),
    comment: text("comment"),
    status: varchar("status").notNull(),
});

export const reservationGroups = pgTable("reservation_groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name"),
    description: text("description"),
    reservationId: uuid("reservation_id").references(() => classroomReservations.id).notNull(),
    groupId: uuid("group_id").references(() => groups.id).notNull(),
    additionalInfo: text("additional_info"),
});

export const reservationStudents = pgTable("reservation_students", {
    id: uuid("id").primaryKey().defaultRandom(),
    reservationId: uuid("reservation_id").references(() => classroomReservations.id).notNull(),
    studentId: uuid("student_id").references(() => students.id).notNull(),
    additionalInfo: text("additional_info"),
});

export const students = pgTable("students", {
    id: uuid("id").primaryKey().defaultRandom(),
    firstName: varchar("first_name").notNull(),
    lastName: varchar("last_name").notNull(),
    phoneNumber: varchar("phone_number"),
    email: varchar("email"),
    additionalInfo: text("additional_info"),
});

export const teacherGroups = pgTable("teacher_groups", {
    id: uuid("id").primaryKey().defaultRandom(),
    groupId: uuid("group_id").references(() => groups.id).unique().notNull(),
    teacherId: uuid("teacher_id").references(() => users.id).notNull(),
});


export const table = {
    classroomReservations,
    classrooms,
    users,
    groupStudents,
    groups,
    onlineClassrooms,
    reservationGroups,
    reservationStudents,
    students,
    teacherGroups,
} as const;

export type table = typeof table;