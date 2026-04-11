import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';
import { selectSimpleUserSchema } from './users';
import { selectSimpleClassroomReservationSchema } from './classroom_reservations';

const _insertResevationCyclesSchema = createInsertSchema(table.reservationCycles);
const _selectResevationCyclesSchema = createSelectSchema(table.reservationCycles);
const _updateResevationCyclesSchema = createUpdateSchema(table.reservationCycles);

// Inserts
export const insertReservationCycleSchema = t.Omit(_insertResevationCyclesSchema, ['id']);

// Selects
export const selectSimpleReservationCycleSchema = _selectResevationCyclesSchema;

export const selectCompositeReservationCycleSchema = t.Composite([
    t.Object(_selectResevationCyclesSchema),
    t.Object({
        reservations: t.Array(selectSimpleClassroomReservationSchema),
        teacher: selectSimpleUserSchema
    })
]);

// Updates
export const updateReservationCycleSchema = _updateResevationCyclesSchema;

// Deletes
export const removeReservationCycleSchema = t.Omit(_selectResevationCyclesSchema, ['name', 'description']);
