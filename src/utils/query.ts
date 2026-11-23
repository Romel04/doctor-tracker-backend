export function paginationMeta(total: number, page: number, limit: number) {
    return {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
    };
}

// Builds a MongoDB date range. "to" is inclusive of the whole day.
export function dateRange(from?: Date, to?: Date) {
    if (!from && !to) return undefined;
    const range: { $gte?: Date; $lte?: Date } = {};
    if (from) range.$gte = from;
    if (to) {
        const end = new Date(to);
        end.setUTCHours(23, 59, 59, 999);
        range.$lte = end;
    }
    return range;
}