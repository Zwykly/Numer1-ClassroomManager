import { selectCompositeClassroomReservationSchema, paginatedClassroomReservationsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { ClassroomReservationsController } from "../controllers/classroom_reservations";
import { insertClassroomReservationSchema, updateClassroomReservationSchema, patchClassroomReservationSchema, classroomReservationsQuerySchema } from "../models/classroom_reservations";
import { authGuard } from "../auth/authGuard";

const classroomReservationsRoutes = new Elysia({
    prefix: "/classroom-reservations",
})
    .use(authGuard)
    .get("/", ClassroomReservationsController.getAll, {
        query: classroomReservationsQuerySchema,
        response: paginatedClassroomReservationsResponseSchema
    })
    .get("/:id", ClassroomReservationsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeClassroomReservationSchema
    })
    .post("/", ClassroomReservationsController.create, {
        body: insertClassroomReservationSchema,
        response: selectCompositeClassroomReservationSchema
    })
    .put("/:id", ClassroomReservationsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateClassroomReservationSchema,
        response: selectCompositeClassroomReservationSchema
    })
    .patch("/:id", ClassroomReservationsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchClassroomReservationSchema,
        response: selectCompositeClassroomReservationSchema
    })
    .delete("/:id", ClassroomReservationsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default classroomReservationsRoutes;