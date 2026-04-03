import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertGroupStudentsSchema = createInsertSchema(table.groupStudents, {
    groupId: t.String({ format: 'uuid', default: '' }),
    studentId: t.String({ format: 'uuid', default: '' })
});
const _selectGroupStudentsSchema = createSelectSchema(table.groupStudents);
const _updateGroupStudentsSchema = createUpdateSchema(table.groupStudents, {
    groupId: t.String({ format: 'uuid', default: '' }),
    studentId: t.String({ format: 'uuid', default: '' })
});

export const insertGroupStudentSchema = t.Omit(_insertGroupStudentsSchema, ['id']);
export const selectGroupStudentSchema = _selectGroupStudentsSchema;
export const updateGroupStudentSchema = _updateGroupStudentsSchema;
export const removeGroupStudentSchema = t.Omit(_selectGroupStudentsSchema, ['groupId', 'studentId']);
