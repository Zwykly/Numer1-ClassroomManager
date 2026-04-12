import { t, type TSchema } from 'elysia';

export const paginationQuerySchema = t.Object({
    limit: t.Optional(t.Numeric({ default: 10, maximum: 100, minimum: 1 })),
    cursor: t.Optional(t.String({ format: 'uuid' })),
});

export const createPaginationResponseSchema = <T extends TSchema>(itemSchema: T) => t.Object({
    data: t.Array(itemSchema),
    nextCursor: t.Optional(t.String({ format: 'uuid' })),
});

// Schema pozwalając na w łatwy sposób zastowsowanie tablicy stringów, do mapowania w querry
export const createFilterArraySchema = () => t.Optional(
    t.Union([
        t.String(),
        t.Array(t.String())
    ])
);
