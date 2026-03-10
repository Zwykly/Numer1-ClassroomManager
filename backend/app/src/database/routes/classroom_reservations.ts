import { Elysia } from "elysia";
import classroomReservationsController from "../controllers/classroom_reservations";

const classroomReservationsRoutes = new Elysia({
    prefix: "/classroom-reservations",
    })
    .get("/all", () => {
        const data = classroomReservationsController.getAll();
        return { success: true, data };
    })
    .get("/:id", ({ params }) => {
        const data = classroomReservationsController.getById(params.id);
        return { success: true, data };
    })
    .post("/", ({ body }) => {
        const data = classroomReservationsController.create(body);
        return { success: true, data };
    })
    .put("/:id", ({ params, body }) => {
        const data = classroomReservationsController.update(params.id, body);
        return { success: true, data };
    })
    .delete("/:id", ({ params }) => {
        const data = classroomReservationsController.delete(params.id);
        return { success: true, data };
    });


export default classroomReservationsRoutes;