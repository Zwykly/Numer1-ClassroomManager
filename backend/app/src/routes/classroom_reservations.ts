import { selectCompositeClassroomReservationSchema, paginatedClassroomReservationsResponseSchema, recurringClassroomReservationsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { ClassroomReservationsController } from "../controllers/classroom_reservations";
import { createClassroomReservationSchema, createRecurringReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema, checkConflictsSchema, conflictResultSchema } from "../models/classroom_reservations";
import { authGuard } from "../auth/authGuard";

const classroomReservationsRoutes = new Elysia({
    prefix: "/classroom-reservations",
})
    .use(authGuard)
    .get("/", ClassroomReservationsController.getAll, {
        query: classroomReservationsQuerySchema,
        response: paginatedClassroomReservationsResponseSchema,
        isAuth: true
    })
    .get("/:id", ClassroomReservationsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeClassroomReservationSchema,
        isAuth: true
    })
    .post("/", ClassroomReservationsController.create, {
        body: createClassroomReservationSchema,
        response: selectCompositeClassroomReservationSchema,
        isAuth: true
    })
    .post("/conflicts", ClassroomReservationsController.checkConflicts, {
        body: checkConflictsSchema,
        response: conflictResultSchema,
        isAuth: true
    })
    .post("/recurring", ClassroomReservationsController.createRecurring, {
        body: createRecurringReservationSchema,
        response: recurringClassroomReservationsResponseSchema,
        isAuth: true
    })
    .put("/:id", ClassroomReservationsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateClassroomReservationSchema,
        response: selectCompositeClassroomReservationSchema,
        isAuth: true
    })
    .patch("/:id", ClassroomReservationsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchClassroomReservationSchema,
        response: selectCompositeClassroomReservationSchema,
        isAuth: true
    })
    .delete("/:id", ClassroomReservationsController.remove, {
        params: t.Object({ id: t.String() }),
        isAuth: true
    });

export default classroomReservationsRoutes;
