using Infrastructure.Common;

namespace Presentation.Models;

/// <summary>
/// Standard API response wrapper for all endpoints
/// </summary>
public class ApiResponse
{
    public bool Success { get; set; }
    public List<ApiError> Errors { get; set; } = [];
    public object? Data { get; set; }

    public ApiResponse()
    {
    }

    public ApiResponse(bool success)
    {
        Success = success;
    }

    public ApiResponse(object data)
    {
        Success = true;
        Data = data;
    }

    public ApiResponse(List<ApiError> errors)
    {
        Success = false;
        Errors = errors;
    }

    public ApiResponse(ApiError error)
    {
        Success = false;
        Errors = [error];
    }
}

/// <summary>
/// Generic API response with typed data
/// </summary>
/// <typeparam name="T">Type of the response data</typeparam>
public class ApiResponse<T> : ApiResponse
{
    public new T? Data { get; set; }

    public ApiResponse() : base()
    {
    }

    public ApiResponse(T data) : base(true)
    {
        Data = data;
    }

    public ApiResponse(List<ApiError> errors) : base(errors)
    {
    }

    public ApiResponse(ApiError error) : base(error)
    {
    }
}

/// <summary>
/// Error information for API responses
/// </summary>
public class ApiError
{
    public string Code { get; set; } = string.Empty;
    public string? Message { get; set; }
    public Dictionary<string, object> Parameters { get; set; } = new();

    public ApiError()
    {
    }

    public ApiError(string code)
    {
        Code = code;
    }

    public ApiError(string code, string message)
    {
        Code = code;
        Message = message;
    }

    public ApiError(string code, string message, Dictionary<string, object> parameters)
    {
        Code = code;
        Message = message;
        Parameters = parameters;
    }
}

/// <summary>
/// Paginated API response
/// </summary>
/// <typeparam name="T">Type of the items in the paginated response</typeparam>
public class PaginatedApiResponse<T> : ApiResponse<PaginationData<T>>
{
    public PaginatedApiResponse() : base()
    {
    }

    public PaginatedApiResponse(PaginatedResult<T> paginatedResult) : base()
    {
        Success = true;
        Data = new PaginationData<T>
        {
            Items = paginatedResult.Items,
            TotalCount = paginatedResult.TotalCount,
            Page = paginatedResult.Page,
            PageSize = paginatedResult.PageSize,
            TotalPages = paginatedResult.TotalPages,
            HasNextPage = paginatedResult.HasNextPage,
            HasPreviousPage = paginatedResult.HasPreviousPage
        };
    }

    public PaginatedApiResponse(List<ApiError> errors) : base(errors)
    {
    }

    public PaginatedApiResponse(ApiError error) : base(error)
    {
    }
}

/// <summary>
/// Pagination data wrapper
/// </summary>
/// <typeparam name="T">Type of the items</typeparam>
public class PaginationData<T>
{
    public List<T> Items { get; set; } = [];
    public int TotalCount { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
}