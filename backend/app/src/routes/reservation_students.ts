import { Elysia, t } from "elysia";
import { reservationStudentsController } from "../controllers/reservation_students";
import { insertReservationStudentSchema, selectReservationStudentSchema, updateReservationStudentSchema, removeReservationStudentSchema } from "../models/reservation_students"

const reservationStudentsRoutes = new Elysia({
    prefix: "/reservation-students",
})
    .get("/", async () => await reservationStudentsController.getAllReservationStudents(), {
        response: t.Array(selectReservationStudentSchema)
    })
    .post("/", async ({ body }) => await reservationStudentsController.createReservationStudent(body), {
        body: insertReservationStudentSchema,
        response: selectReservationStudentSchema
    })
    .put("/", async ({ body }) => await reservationStudentsController.updateReservationStudent(body), {
        body: updateReservationStudentSchema,
        response: selectReservationStudentSchema
    })
    .delete("/", async ({ body }) => await reservationStudentsController.removeReservationStudent(body), {
        body: removeReservationStudentSchema,
        response: selectReservationStudentSchema
    });

export default reservationStudentsRoutes;
