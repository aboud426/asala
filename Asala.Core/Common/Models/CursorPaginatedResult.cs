using System.Collections.Generic;

namespace Asala.Core.Common.Models;

public class CursorPaginatedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int? NextCursor { get; set; }
    public int? PreviousCursor { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }

    public CursorPaginatedResult(
        List<T> items,
        int? nextCursor,
        int? previousCursor,
        bool hasNextPage,
        bool hasPreviousPage,
        int pageSize,
        int totalCount = 0
    )
    {
        Items = items ?? [];
        NextCursor = nextCursor;
        PreviousCursor = previousCursor;
        HasNextPage = hasNextPage;
        HasPreviousPage = hasPreviousPage;
        PageSize = pageSize;
        TotalCount = totalCount;
    }

    public static Result<CursorPaginatedResult<T>> Create(
        List<T> items,
        int? nextCursor,
        int? previousCursor,
        bool hasNextPage,
        bool hasPreviousPage,
        int pageSize,
        int totalCount = 0
    )
    {
        return Result.Success(
            new CursorPaginatedResult<T>(
                items,
                nextCursor,
                previousCursor,
                hasNextPage,
                hasPreviousPage,
                pageSize,
                totalCount
            )
        );
    }
}
