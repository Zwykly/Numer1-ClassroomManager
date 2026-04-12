export function getCursorWhere(cursor?: string): Record<string, any> | undefined {
    return cursor ? { id: { gt: cursor } } : undefined;
}

export function getLimit(limit?: number): number {
    return limit && limit > 0 && limit <= 100 ? limit + 1 : 11;
}

export function buildPaginationResponse<T extends Record<string, any>>(
    data: T[],
    limit: number | undefined,
    cursorKey: keyof T = "id"
) {
    const actualLimit = limit && limit > 0 && limit <= 100 ? limit : 10;
    const hasNextCursor = data.length > actualLimit;
    const items = hasNextCursor ? data.slice(0, -1) : data;
    const nextCursor = hasNextCursor ? items[items.length - 1][cursorKey] as string : undefined;

    return {
        data: items,
        nextCursor
    };
}

export function normalizeFilterArray(val: string | string[] | undefined): string[] | undefined {
    if (!val) return undefined;
    if (Array.isArray(val)) return val.length > 0 ? val : undefined;
    return [val];
}

export function getInArrayWhere(columnName: string, values?: string | string[]): Record<string, any> | undefined {
    const normalized = normalizeFilterArray(values);
    return normalized ? { [columnName]: { in: normalized } } : undefined;
}

export function getFuzzySearchWhere(columnNames: string[], value?: string): Record<string, any> | undefined {
    if (!value) return undefined;
    
    if (columnNames.length === 1) {
        return { [columnNames[0]]: { ilike: `%${value}%` } };
    }

    return {
        OR: columnNames.map(col => ({
            [col]: { ilike: `%${value}%` }
        }))
    };
}
