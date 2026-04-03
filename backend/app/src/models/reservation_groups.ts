import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertReservationGroupsSchema = createInsertSchema(table.reservationGroups, {
    reservationId: t.String({ format: 'uuid', default: '' }),
    groupId: t.String({ format: 'uuid', default: '' })
});
const _selectReservationGroupsSchema = createSelectSchema(table.reservationGroups);
const _updateReservationGroupsSchema = createUpdateSchema(table.reservationGroups, {
    reservationId: t.String({ format: 'uuid', default: '' }),
    groupId: t.String({ format: 'uuid', default: '' })
});

export const insertReservationGroupSchema = t.Omit(_insertReservationGroupsSchema, ['id']);
export const selectReservationGroupSchema = _selectReservationGroupsSchema;
export const updateReservationGroupSchema = _updateReservationGroupsSchema;
export const removeReservationGroupSchema = t.Omit(_selectReservationGroupsSchema, ['name', 'description', 'reservationId', 'groupId', 'additionalInfo']);
