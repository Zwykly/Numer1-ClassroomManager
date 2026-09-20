import * as p from "drizzle-orm/pg-core";
import { defineRelations } from 'drizzle-orm';
import { user } from "../../auth-schema";

export const reservationStatusEnum = p.pgEnum("reservationStatus", ["scheduled", "canceled", "ongoing", "completed","cyclical"])

//Rezerwacja klasy wykonana przez użytkownika/nauczyciela
//Relacje: users, classrooms, onlineClassrooms
export const classroomReservations = p.pgTable("classroomReservations", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name"),
    classroomId: p.uuid("classroomId").references(() => classrooms.id),
    onlineClassroomId: p.uuid("onlineClassroomId").references(() => onlineClassrooms.id),
    reservationTime: p.timestamp("reservationTime").notNull(),
    durationMinutes: p.integer("durationMinutes"),
    teacherId: p.uuid("teacherId").references(() => users.id).notNull(),
    additionalInfo: p.text("additionalInfo"),
    createdOn: p.timestamp("createdOn").defaultNow().notNull(),
    status: reservationStatusEnum().default("scheduled").notNull(),
    cycleId: p.uuid("cycleId").references(() => reservationCycles.id),
    editedOn: p.timestamp("editedOn").defaultNow().notNull(),
});

//Enum mówiący o tym czy rezerwacja cykliczna powina być aktywna i aktywowana,
// czy rezerwacje związane z nią powinny być aktywne lub zarchiwizowane
export const reservationCycleStatusEnum = p.pgEnum("reservationCycleStatus", ["active", "archived"])

//Rekord który infomuje o cykliczności rezerwacji, definiuje to czy cykliczność jest określana
// przez datę końcową czy przez ilość spotkań.
export const reservationCycles = p.pgTable("reservationCycles", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    teacherId: p.uuid("teacherId").references(() => users.id).notNull(),
    additionalInfo: p.text("additionalInfo"),
    anchorDate: p.timestamp("anchorDate").notNull(),
    cycleEndDate: p.timestamp("cycleEndDate"),
    numberOfOccurrences: p.integer("numberOfOccurrences"),
    frequency: p.integer("frequency").notNull(),
    status: reservationCycleStatusEnum().default("active").notNull(),
    createdOn: p.timestamp("createdOn").defaultNow().notNull(),
});

// Instancja klasy w szkole, jest to sala która może posadzić określoną liczbę osób
// To one przypisywane są do rezerwacji.
export const classrooms = p.pgTable("classrooms", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name").notNull(),
    maxNumberOfPeople: p.integer("maxNumberOfPeople").notNull(),
    additionalInfo: p.text("additionalInfo"),
    status: p.varchar("status").notNull(),
});

export const rolesEnum = p.pgEnum("roles", ["admin", "teacher"]);

// Użytkownik to nauczyciel, ma on wyznaczoną rolę czyli może być zwykłym lub adminem.
// Jest to tabela przechowująca tylko informacje o użytkowniku, nie przechowuje ona loginu
export const users = p.pgTable("users", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    authId: p.varchar('authId', { length: 255 }).unique(),
    firstName: p.varchar("firstName").notNull(),
    lastName: p.varchar("lastName").notNull(),
    email: p.varchar("email").notNull(),
    additionalInfo: p.text("additionalInfo"),
    role: rolesEnum().default("teacher"),
    color: p.varchar("color")
});

// Tabela przejściowa, aby pomiędzy grupami a studentami była relacja wiele do wielu.
export const groupStudents = p.pgTable("groupStudents", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    groupId: p.uuid("groupId").references(() => groups.id).notNull(),
    studentId: p.uuid("studentId").references(() => students.id).notNull(),
});

// Tabela group, przechowuje informacje o gropuach do których mogą być przypisani uczniowe 
export const groups = p.pgTable("groups", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name").notNull(),
    description: p.text("description"),
});

// Tabela onlineclassrooms to table która przechowuje inydwulną klasę online dla nauczyciela.
// Dostęp do niej ma jedynie nauczyciel do którego należy oraz administrator
export const onlineClassrooms = p.pgTable("onlineClassrooms", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name").notNull(),
    teacherId: p.uuid("teacherId").references(() => users.id).notNull().unique(),
    comment: p.text("comment"),
    status: p.varchar("status").notNull(),
});

// Tabela przejściowa łącząca relacją wiele do wielu grupy z rezerwacjami
export const reservationGroups = p.pgTable("reservationGroups", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    name: p.varchar("name"),
    description: p.text("description"),
    reservationId: p.uuid("reservationId").references(() => classroomReservations.id).notNull(),
    groupId: p.uuid("groupId").references(() => groups.id).notNull(),
    additionalInfo: p.text("additionalInfo"),
});

// Tabela przejściowa łącząca relacją wiele do wielu uczniów z rezerwacjami
export const reservationStudents = p.pgTable("reservationStudents", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    reservationId: p.uuid("reservationId").references(() => classroomReservations.id).notNull(),
    studentId: p.uuid("studentId").references(() => students.id).notNull(),
    additionalInfo: p.text("additionalInfo"),
});

// Tabela ta przechowuje instancje uczniów, jest to prosty zbiór danych który pozwala dodwać uczniów oraz informacje o nich
export const students = p.pgTable("students", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    firstName: p.varchar("firstName").notNull(),
    lastName: p.varchar("lastName").notNull(),
    phoneNumber: p.varchar("phoneNumber"),
    email: p.varchar("email"),
    additionalInfo: p.text("additionalInfo"),
});

// Tabela pozwalając przypysiwayć grupy nauczycielom, nauczyciele nadal widzą wszystkie grupy ale te są prioretyzowane w wyborze do rezerwacji
export const teacherGroups = p.pgTable("teacherGroups", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    groupId: p.uuid("groupId").references(() => groups.id).notNull(),
    teacherId: p.uuid("teacherId").references(() => users.id).notNull(),
});

// Tabela przejściowa łącząca relacją wiele do wielu uczniów z nauczycielami.
// Nauczyciel widzi oraz może przypisywać do grup jedynie swoich uczniów.
export const teacherStudents = p.pgTable("teacherStudents", {
    id: p.uuid("id").primaryKey().defaultRandom(),
    studentId: p.uuid("studentId").references(() => students.id).notNull(),
    teacherId: p.uuid("teacherId").references(() => users.id).notNull(),
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
    teacherStudents,
    reservationCycles,
} as const;

export type table = typeof table;

export const relations = defineRelations({ ...table, user },
    (r) => ({
        classroomReservations: {
            users: r.one.users({
                from: r.classroomReservations.teacherId,
                to: r.users.id,
            }),
            cycle: r.one.reservationCycles({
                from: r.classroomReservations.cycleId,
                to: r.reservationCycles.id,
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
                from: r.classroomReservations.classroomId,
                to: r.classrooms.id
            }),
            onlineClassrooms: r.one.onlineClassrooms({
                from: r.classroomReservations.onlineClassroomId,
                to: r.onlineClassrooms.id
            })
        },
        reservationCycles: {
            users: r.one.users({
                from: r.reservationCycles.teacherId,
                to: r.users.id,
            }), 
            classroomReservations: r.many.classroomReservations({
                from: r.reservationCycles.id,
                to: r.classroomReservations.cycleId
            }),
            onlineClassrooms: r.many.onlineClassrooms({
                from: r.reservationCycles.id.through(r.classroomReservations.cycleId),
                to: r.onlineClassrooms.id.through(r.classroomReservations.onlineClassroomId)
            }),
            classrooms: r.many.classrooms({
                from: r.reservationCycles.id.through(r.classroomReservations.cycleId),
                to: r.classrooms.id.through(r.classroomReservations.classroomId)
            }),
        }, 
        classrooms: {
            classroomReservations: r.many.classroomReservations({
                from: r.classrooms.id,
                to: r.classroomReservations.classroomId
            }),
            reservationCycles: r.many.reservationCycles({
                from: r.classrooms.id.through(r.classroomReservations.classroomId),
                to: r.reservationCycles.id.through(r.classroomReservations.cycleId)
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
            students: r.many.students({
                from: r.users.id.through(r.teacherStudents.teacherId),
                to: r.students.id.through(r.teacherStudents.studentId)
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
            teachers: r.many.users({
                from: r.students.id.through(r.teacherStudents.studentId),
                to: r.users.id.through(r.teacherStudents.teacherId)
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
            classroomReservations: r.many.classroomReservations({
                from: r.onlineClassrooms.id,
                to: r.classroomReservations.onlineClassroomId,
            }),
            reservationCycles: r.many.reservationCycles({
                from: r.onlineClassrooms.id.through(r.classroomReservations.onlineClassroomId),
                to: r.reservationCycles.id.through(r.classroomReservations.cycleId)
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
        teacherStudents: {
            students: r.one.students({
                from: r.teacherStudents.studentId,
                to: r.students.id
            }),
            users: r.one.users({
                from: r.teacherStudents.teacherId,
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