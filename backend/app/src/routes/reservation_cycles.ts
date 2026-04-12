import { selectCompositeReservationCycleSchema, paginatedReservationCyclesResponseSchema } from "../models/composite";
import { Elysia, t } from "elysia";
import { ReservationCyclesController } from "../controllers/reservation_cycles";
import { insertReservationCycleSchema, updateReservationCycleSchema, patchReservationCycleSchema, reservationCyclesQuerySchema } from "../models/reservation_cycles";
import { authGuard } from "../auth/authGuard";

const reservationCyclesRoutes = new Elysia({
    prefix: "/reservation-cycles",
})
    .use(authGuard)
    .get("/", ReservationCyclesController.getAll, {
        query: reservationCyclesQuerySchema,
        response: paginatedReservationCyclesResponseSchema
    })
    .get("/:id", ReservationCyclesController.getById, {
        params: t.Object({ id: t.String() }),
        response: selectCompositeReservationCycleSchema
    })
    .post("/", ReservationCyclesController.create, {
        body: insertReservationCycleSchema,
        response: selectCompositeReservationCycleSchema
    })
    .put("/:id", ReservationCyclesController.update, {
        params: t.Object({ id: t.String() }),
        body: updateReservationCycleSchema,
        response: selectCompositeReservationCycleSchema
    })
    .patch("/:id", ReservationCyclesController.patch, {
        params: t.Object({ id: t.String() }),
        body: patchReservationCycleSchema,
        response: selectCompositeReservationCycleSchema
    })
    .delete("/:id", ReservationCyclesController.remove, {
        params: t.Object({ id: t.String() }),
    });

export default reservationCyclesRoutes;