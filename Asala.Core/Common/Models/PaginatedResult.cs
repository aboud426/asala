using System;
using System.Collections.Generic;

namespace Asala.Core.Common.Models;

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
    public bool HasNextPage => Page < TotalPages;
    public bool HasPreviousPage => Page > 1;

    public PaginatedResult(List<T> items, int totalCount, int page, int pageSize)
    {
        Items = items ?? [];
        TotalCount = totalCount;
        Page = page;
        PageSize = pageSize;
    }

    public static Result<PaginatedResult<T>> Create(
        List<T> items,
        int totalCount,
        int page,
        int pageSize
    )
    {
        return Result.Success(new PaginatedResult<T>(items, totalCount, page, pageSize));
    }
}
