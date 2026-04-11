import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';



const _insertReservationGroupsSchema = createInsertSchema(table.reservationGroups);
const _selectReservationGroupsSchema = createSelectSchema(table.reservationGroups);
const _updateReservationGroupsSchema = createUpdateSchema(table.reservationGroups);


// Inserts
export const insertReservationGroupSchema = t.Omit(_insertReservationGroupsSchema, ['id']);

// Selects
export const selectReservationGroupSchema = _selectReservationGroupsSchema;

// Updates
export const updateReservationGroupSchema = _updateReservationGroupsSchema;

// Deletes
export const removeReservationGroupSchema = t.Omit(_selectReservationGroupsSchema, ['name', 'description', 'reservationId', 'groupId', 'additionalInfo']);
