import { paginatedReservationStudentsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { ReservationStudentsController } from "../controllers/reservation_students";
import { insertReservationStudentSchema, selectSimpleReservationStudentSchema, updateReservationStudentSchema, patchReservationStudentSchema, reservationStudentsQuerySchema } from "../models/reservation_students";
import { authGuard } from "../auth/authGuard";

const reservationStudentsRoutes = new Elysia({
    prefix: "/reservation-students",
})
    .use(authGuard)
    .get("/", ReservationStudentsController.getAll, {
        query: reservationStudentsQuerySchema,
        response: paginatedReservationStudentsResponseSchema
    })
    .get("/:id", ReservationStudentsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectSimpleReservationStudentSchema
    })
    .post("/", ReservationStudentsController.create, {
        body: insertReservationStudentSchema,
        response: selectSimpleReservationStudentSchema
    })
    .put("/:id", ReservationStudentsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateReservationStudentSchema,
        response: selectSimpleReservationStudentSchema
    })
    .patch("/:id", ReservationStudentsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchReservationStudentSchema,
        response: selectSimpleReservationStudentSchema
    })
    .delete("/:id", ReservationStudentsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default reservationStudentsRoutes;
