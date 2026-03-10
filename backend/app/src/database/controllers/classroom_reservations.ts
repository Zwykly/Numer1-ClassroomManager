import { db } from "../../index";
import { classroomReservations } from "../schemas";
import { eq } from "drizzle-orm";

const classroomReservationsController = {
    getAll: async () => {
        return await db.select().from(classroomReservations);
    },
    getById: async (id: string) => {
        return await db.select().from(classroomReservations)
            .where(eq(classroomReservations.id, id));
    },
    create: async (classroomReservation: typeof classroomReservations.$inferInsert) => {
        return await db.insert(classroomReservations).values(classroomReservation);
    },
    update: async (id: string, classroomReservation: typeof classroomReservations) => {
        return await db.update(classroomReservations)
            .set(classroomReservation)
            .where(eq(classroomReservations.id, id));
    },
    delete: async (id: string) => {
        return await db.delete(classroomReservations)
            .where(eq(classroomReservations.id, id));
    },
};

export default classroomReservationsController;