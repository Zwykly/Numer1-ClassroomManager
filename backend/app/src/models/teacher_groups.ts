import { t } from 'elysia';
import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-typebox';
import { table } from '../db/schema';

const _insertTeacherGroupsSchema = createInsertSchema(table.teacherGroups, {
    groupId: t.String({ format: 'uuid', default: '' }),
    teacherId: t.String({ format: 'uuid', default: '' })
});
const _selectTeacherGroupsSchema = createSelectSchema(table.teacherGroups);
const _updateTeacherGroupsSchema = createUpdateSchema(table.teacherGroups, {
    groupId: t.String({ format: 'uuid', default: '' }),
    teacherId: t.String({ format: 'uuid', default: '' })
});

export const insertTeacherGroupSchema = t.Omit(_insertTeacherGroupsSchema, ['id']);
export const selectTeacherGroupSchema = _selectTeacherGroupsSchema;
export const updateTeacherGroupSchema = _updateTeacherGroupsSchema;
export const removeTeacherGroupSchema = t.Omit(_selectTeacherGroupsSchema, ['groupId', 'teacherId']);
