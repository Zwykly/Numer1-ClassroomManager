import * as p from "drizzle-orm/pg-core";
import { defineRelations } from 'drizzle-orm';
import { user } from "../../auth-schema";

export const classroomReservations = p.pgTable("classroom_reservations", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    classroomID: p.uuid("classroom_id").references(() => classrooms.id).notNull(),
    onlineClassroomID: p.uuid("online_classroom_id").references(() => onlineClassrooms.id).notNull(),
    startDate: p.timestamp("start_date").notNull(),
    endDate: p.timestamp("end_date").notNull(),
    teacherId: p.uuid("teacher_id").references(() => users.id).notNull(),
    additionalInfo: p.text("additional_info"),
    createdOn: p.timestamp("created_on").defaultNow().notNull(),
    editedOn: p.timestamp("edited_on").defaultNow().notNull(),
});

export const classrooms = p.pgTable("classrooms", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name").notNull(),
    maxNumberOfPeople: p.integer("max_number_of_people").notNull(),
    additionalInfo: p.text("additional_info"),
    status: p.varchar("status").notNull(),
});

export const rolesEnum = p.pgEnum("roles", ["admin", "teacher"]);

export const users = p.pgTable("users", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    authId: p.varchar('auth_id', { length: 255 }).unique(),
    firstName: p.varchar("first_name").notNull(),
    lastName: p.varchar("last_name").notNull(),
    email: p.varchar("email").notNull(),
    additionalInfo: p.text("additional_info"),
    role: rolesEnum().default("teacher")
});

export const groupStudents = p.pgTable("group_students", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    groupId: p.uuid("group_id").references(() => groups.id).notNull(),
    studentId: p.uuid("student_id").references(() => students.id).notNull(),
});

export const groups = p.pgTable("groups", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name").notNull(),
    description: p.text("description"),
});

export const onlineClassrooms = p.pgTable("online_classrooms", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name").notNull(),
    teacherId: p.uuid("teacher_id").references(() => users.id).notNull(),
    comment: p.text("comment"),
    status: p.varchar("status").notNull(),
});

export const reservationGroups = p.pgTable("reservation_groups", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name"),
    description: p.text("description"),
    reservationId: p.uuid("reservation_id").references(() => classroomReservations.id).notNull(),
    groupId: p.uuid("group_id").references(() => groups.id).notNull(),
    additionalInfo: p.text("additional_info"),
});

export const reservationStudents = p.pgTable("reservation_students", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    reservationId: p.uuid("reservation_id").references(() => classroomReservations.id).notNull(),
    studentId: p.uuid("student_id").references(() => students.id).notNull(),
    additionalInfo: p.text("additional_info"),
});

export const students = p.pgTable("students", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    firstName: p.varchar("first_name").notNull(),
    lastName: p.varchar("last_name").notNull(),
    phoneNumber: p.varchar("phone_number"),
    email: p.varchar("email"),
    additionalInfo: p.text("additional_info"),
});

export const teacherGroups = p.pgTable("teacher_groups", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    groupId: p.uuid("group_id").references(() => groups.id).unique().notNull(),
    teacherId: p.uuid("teacher_id").references(() => users.id).notNull(),
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
            }),
            user: r.one.user({
                from: r.users.authId,
                to: r.user.id
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
        },    
    })
) 