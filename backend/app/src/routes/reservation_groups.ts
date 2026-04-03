import { Elysia, t } from "elysia";
import { reservationGroupsController } from "../controllers/reservation_groups";
import { insertReservationGroupSchema, selectReservationGroupSchema, updateReservationGroupSchema, removeReservationGroupSchema } from "../models/reservation_groups"

const reservationGroupsRoutes = new Elysia({
    prefix: "/reservation-groups",
})
    .get("/", async () => await reservationGroupsController.getAllReservationGroups(), {
        response: t.Array(selectReservationGroupSchema)
    })
    .post("/", async ({ body }) => await reservationGroupsController.createReservationGroup(body), {
        body: insertReservationGroupSchema,
        response: selectReservationGroupSchema
    })
    .put("/", async ({ body }) => await reservationGroupsController.updateReservationGroup(body), {
        body: updateReservationGroupSchema,
        response: selectReservationGroupSchema
    })
    .delete("/", async ({ body }) => await reservationGroupsController.removeReservationGroup(body), {
        body: removeReservationGroupSchema,
        response: selectReservationGroupSchema
    });

export default reservationGroupsRoutes;
