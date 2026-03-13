import { pgTable, uuid, timestamp, text, varchar, integer, pgEnum } from "drizzle-orm/pg-core";
import { defineRelations } from 'drizzle-orm';
import { user } from "../../auth-schema";

export const classroomReservations = pgTable("classroom_reservations", {
    id: uuid("id").primaryKey().defaultRandom(),
    classroomID: uuid("classroom_id").references(() => classrooms.id),
    onlineClassroomID: uuid("online_classroom_id").references(() => onlineClassrooms.id),
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
    authId: varchar('auth_id', { length: 255 }).unique(),
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

export const relations = defineRelations({ ...table, user },
    (r) => ({
        classroomReservations: {
            users: r.one.users({
                from: r.classroomReservations.teacherId,
                to: r.users.id,
            }),
            groups: r.many.groups({
                from: r.classroomReservations.id.through(r.reservationGroups.reservationId),
                to: r.groups.id.through(r.reservationGroups.groupId)
            }),
            students: r.many.students({
                from: r.classroomReservations.id.through(r.reservationStudents.reservationId),
                to: r.students.id.through(r.reservationStudents.studentId)
            }),
            classrooms: r.one.classrooms({
                from: r.classroomReservations.classroomID,
                to: r.classrooms.id
            })
        },
        classrooms: {
            classroomReservations: r.many.classroomReservations({
                from: r.classrooms.id,
                to: r.classroomReservations.classroomID
            })
        },
        users: {
            classroomReservations: r.many.classroomReservations({
                from: r.users.id,
                to: r.classroomReservations.teacherId,
            }),
            onlineClassrooms: r.many.onlineClassrooms({
                from: r.users.id,
                to: r.onlineClassrooms.teacherId,
            }),
            groups: r.many.groups({
                from: r.users.id.through(r.teacherGroups.teacherId),
                to: r.groups.id.through(r.teacherGroups.groupId)
            })
        },
        groups: {
            students: r.many.students({
                from: r.groups.id.through(r.groupStudents.groupId),
                to: r.students.id.through(r.groupStudents.studentId)
            }),
            reservations: r.many.classroomReservations({
                from: r.groups.id.through(r.reservationGroups.groupId),
                to: r.classroomReservations.id.through(r.reservationGroups.reservationId)
            }),
            teachers: r.many.users({
                from: r.groups.id.through(r.teacherGroups.groupId),
                to: r.users.id.through(r.teacherGroups.teacherId)
            })
        },
        students: {
            groups: r.many.groups({
                from: r.students.id.through(r.groupStudents.studentId),
                to: r.groups.id.through(r.groupStudents.groupId)
            }),
            reservations: r.many.classroomReservations({
                from: r.students.id.through(r.reservationStudents.studentId),
                to: r.classroomReservations.id.through(r.reservationStudents.reservationId)
            })
        },
        onlineClassrooms: {
            users: r.one.users({
                from: r.onlineClassrooms.teacherId,
                to: r.users.id
            }),
            groups: r.many.groups({
                from: r.onlineClassrooms.id.through(r.reservationGroups.reservationId),
                to: r.groups.id.through(r.reservationGroups.groupId)
            }),
            reservations: r.many.classroomReservations({
                from: r.onlineClassrooms.id,
                to: r.classroomReservations.onlineClassroomID,
            })
        },
        reservationGroups: {
            groups: r.one.groups({
                from: r.reservationGroups.groupId,
                to: r.groups.id
            }),
            reservations: r.one.classroomReservations({
                from: r.reservationGroups.reservationId,
                to: r.classroomReservations.id
            })
        },
        reservationStudents: {
            students: r.one.students({
                from: r.reservationStudents.studentId,
                to: r.students.id
            }),
            reservations: r.one.classroomReservations({
                from: r.reservationStudents.reservationId,
                to: r.classroomReservations.id
            })
        },
        teacherGroups: {
            groups: r.one.groups({
                from: r.teacherGroups.groupId,
                to: r.groups.id
            }),
            users: r.one.users({
                from: r.teacherGroups.teacherId,
                to: r.users.id
            })
        },
        user: {
            users: r.one.users({
                from: r.user.id,
                to: r.users.authId
            })
        }
    })
) 