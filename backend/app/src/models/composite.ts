import { t } from 'elysia';
import { createPaginationResponseSchema } from './common';

// Import all simple schemas to build composites without causing circular imports in individual model files
import { selectSimpleGroupSchema } from './groups';
import { selectSimpleStudentSchema } from './students';
import { selectSimpleClassroomSchema } from './classrooms';
import { selectSimpleOnlineClassroomSchema } from './online_classrooms';
import { selectSimpleClassroomReservationSchema } from './classroom_reservations';
import { selectSimpleReservationCycleSchema } from './reservation_cycles';
import { selectSimpleGroupStudentSchema } from './group_students';
import { selectSimpleReservationGroupSchema } from './reservation_groups';
import { selectSimpleReservationStudentSchema } from './reservation_students';
import { selectSimpleTeacherGroupSchema } from './teacher_groups';
import { _selectUsersSchema } from './users';
import { _selectClassroomsSchema } from './classrooms';
import { _selectStudentsSchema } from './students';
import { _selectGroupsSchema } from './groups';
import { _selectOnlineClassroomsSchema } from './online_classrooms';
import { _selectClassroomReservationsSchema } from './classroom_reservations';
import { _selectReservationCyclesSchema } from './reservation_cycles';

// Keep the user shape local to avoid TDZ when modules are loaded in a circular order.
const _selectSimpleUserSchema = t.Omit(_selectUsersSchema, ['authId', 'email', 'additionalInfo', 'role']);


// --- Users ---
export const selectCompositeUserSchema = t.Composite([
    t.Omit(_selectUsersSchema, ['authId']),
    t.Object({
        groups: t.Optional(t.Array(selectSimpleGroupSchema)),
        reservations: t.Optional(t.Array(selectSimpleClassroomReservationSchema)),
        onlineClassroom: t.Optional(selectSimpleOnlineClassroomSchema)
    })
]);
export const paginatedUsersResponseSchema = createPaginationResponseSchema(selectCompositeUserSchema);
export const createUserAccountResponseSchema = t.Object({
    user: selectCompositeUserSchema,
    password: t.String(),
});

// --- Students ---
export const selectCompositeStudentSchema = t.Composite([
    _selectStudentsSchema,
    t.Object({
        groups: t.Optional(t.Array(selectSimpleGroupSchema)),
        reservations: t.Optional(t.Array(selectSimpleClassroomReservationSchema)),
    })
]);
export const paginatedStudentsResponseSchema = createPaginationResponseSchema(selectCompositeStudentSchema);
export const selectStudentsBatchResponseSchema = t.Array(selectCompositeStudentSchema);

// --- Groups ---
export const selectCompositeGroupSchema = t.Composite([
    _selectGroupsSchema,
    t.Object({
        students: t.Optional(t.Array(selectSimpleStudentSchema)),
        users: t.Optional(t.Array(_selectSimpleUserSchema)),
        reservations: t.Optional(t.Array(selectSimpleClassroomReservationSchema)),
    })
]);
export const paginatedGroupsResponseSchema = createPaginationResponseSchema(selectCompositeGroupSchema);

// --- Classrooms ---
export const selectCompositeClassroomSchema = t.Composite([
    _selectClassroomsSchema,
    t.Object({
        reservations: t.Optional(t.Array(selectSimpleClassroomReservationSchema)),
    })
]);
export const paginatedClassroomsResponseSchema = createPaginationResponseSchema(selectCompositeClassroomSchema);

// --- Online Classrooms ---
export const selectCompositeOnlineClassroomSchema = t.Composite([
    _selectOnlineClassroomsSchema,
    t.Object({
        reservations: t.Optional(t.Array(selectSimpleClassroomReservationSchema)),
        reservationCycles: t.Optional(t.Array(selectSimpleReservationCycleSchema))
    })
]);
export const paginatedOnlineClassroomsResponseSchema = createPaginationResponseSchema(selectCompositeOnlineClassroomSchema);

// --- Classroom Reservations ---
export const selectCompositeClassroomReservationSchema = t.Composite([
    _selectClassroomReservationsSchema,
    t.Object({
        teacher: t.Optional(_selectSimpleUserSchema),
        groups: t.Optional(t.Array(selectCompositeGroupSchema)),
        students: t.Optional(t.Array(selectSimpleStudentSchema)),
        classroom: t.Optional(selectSimpleClassroomSchema),
        onlineClassroom: t.Optional(selectSimpleOnlineClassroomSchema)
    })
]);
export const paginatedClassroomReservationsResponseSchema = createPaginationResponseSchema(selectCompositeClassroomReservationSchema);
export const recurringClassroomReservationsResponseSchema = t.Array(selectCompositeClassroomReservationSchema);

// Lightweight reservation shape used by the calendar views (no attendee payloads)
export const selectCalendarReservationSchema = t.Composite([
    _selectClassroomReservationsSchema,
    t.Object({
        teacher: t.Optional(_selectSimpleUserSchema),
        groups: t.Optional(t.Array(selectSimpleGroupSchema)),
        classroom: t.Optional(selectSimpleClassroomSchema),
        onlineClassroom: t.Optional(selectSimpleOnlineClassroomSchema)
    })
]);
export const calendarClassroomReservationsResponseSchema = t.Array(selectCalendarReservationSchema);

// --- Reservation Cycles ---
export const selectCompositeReservationCycleSchema = t.Composite([
    _selectReservationCyclesSchema,
    t.Object({
        teacher: t.Optional(_selectSimpleUserSchema),
        reservations: t.Optional(t.Array(selectSimpleClassroomReservationSchema)),
    })
]);
export const paginatedReservationCyclesResponseSchema = createPaginationResponseSchema(selectCompositeReservationCycleSchema);

// --- Join Tables ---
export const paginatedGroupStudentsResponseSchema = createPaginationResponseSchema(selectSimpleGroupStudentSchema);
export const paginatedReservationGroupsResponseSchema = createPaginationResponseSchema(selectSimpleReservationGroupSchema);
export const paginatedReservationStudentsResponseSchema = createPaginationResponseSchema(selectSimpleReservationStudentSchema);
export const paginatedTeacherGroupsResponseSchema = createPaginationResponseSchema(selectSimpleTeacherGroupSchema);

