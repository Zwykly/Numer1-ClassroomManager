import { paginatedReservationGroupsResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { ReservationGroupsController } from "../controllers/reservation_groups";
import { insertReservationGroupSchema, selectSimpleReservationGroupSchema, updateReservationGroupSchema, patchReservationGroupSchema, reservationGroupsQuerySchema } from "../models/reservation_groups";
import { authGuard } from "../auth/authGuard";

const reservationGroupsRoutes = new Elysia({
    prefix: "/reservation-groups",
})
    .use(authGuard)
    .get("/", ReservationGroupsController.getAll, {
        query: reservationGroupsQuerySchema,
        response: paginatedReservationGroupsResponseSchema
    })
    .get("/:id", ReservationGroupsController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectSimpleReservationGroupSchema
    })
    .post("/", ReservationGroupsController.create, {
        body: insertReservationGroupSchema,
        response: selectSimpleReservationGroupSchema
    })
    .put("/:id", ReservationGroupsController.update, {
        params: t.Object({ id: t.String() }),
        body: updateReservationGroupSchema,
        response: selectSimpleReservationGroupSchema
    })
    .patch("/:id", ReservationGroupsController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchReservationGroupSchema,
        response: selectSimpleReservationGroupSchema
    })
    .delete("/:id", ReservationGroupsController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default reservationGroupsRoutes;
