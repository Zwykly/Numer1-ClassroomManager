import { Elysia } from "elysia";

import classroomReservationsRoutes from "./classroom_reservations";
import classroomsRoutes from "./classrooms";
import usersRoutes from "./users";
import groupsRoutes from "./groups";
import groupStudentsRoutes from "./group_students";
import onlineClassroomsRoutes from "./online_classrooms";
import reservationGroupsRoutes from "./reservation_groups";
import reservationStudentsRoutes from "./reservation_students";
import studentsRoutes from "./students";
import teacherGroupsRoutes from "./teacher_groups";
import reservationCyclesRoutes from "./reservation_cycles";

const apiRoutes =  new Elysia()
    .use(classroomReservationsRoutes)
    .use(classroomsRoutes)
    .use(usersRoutes)
    .use(groupsRoutes)
    .use(groupStudentsRoutes)
    .use(onlineClassroomsRoutes)
    .use(reservationGroupsRoutes)
    .use(reservationStudentsRoutes)
    .use(studentsRoutes)
    .use(teacherGroupsRoutes)
    .use(reservationCyclesRoutes)

export default apiRoutes;