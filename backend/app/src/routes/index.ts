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

const routes = {
    classroomReservationsRoutes,
    classroomsRoutes,
    usersRoutes,
    groupsRoutes,
    groupStudentsRoutes,
    onlineClassroomsRoutes,
    reservationGroupsRoutes,
    reservationStudentsRoutes,
    studentsRoutes,
    teacherGroupsRoutes,
} as const;
export default routes;