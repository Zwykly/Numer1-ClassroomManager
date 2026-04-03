import { Elysia , t} from "elysia";
import { classroomReservationsController } from "../controllers/classroom_reservations";
import { insertClassroomReservationSchema, selectClassroomReservationSchema, updateClassroomReservationSchema, removeClassroomReservationSchema} from "../models/classroom_reservations"

const classroomReservationsRoutes = new Elysia({
    prefix: "/classroom-reservations",
    })
    .get("/", async () => await classroomReservationsController.getAllClassroomReservations(), {
        response: t.Array(selectClassroomReservationSchema)
    })
    .post("/", async ({ body }) => await classroomReservationsController.createClassroomReservation(body), {
        body: insertClassroomReservationSchema,
        response: selectClassroomReservationSchema
    })
    .put("/", async ({ body }) => await classroomReservationsController.updateClassroomReservation(body), {
        body: updateClassroomReservationSchema,
        response: selectClassroomReservationSchema
    })
    .delete("/", async ({ body }) => await classroomReservationsController.removeClassroomReservation(body), {
        body: removeClassroomReservationSchema,
        response: selectClassroomReservationSchema
    });


export default classroomReservationsRoutes;