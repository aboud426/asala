using Infrastructure.Common;
using Business.Services;

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

/// <summary>
/// Localized API error with resolved message text
/// </summary>
public class LocalizedApiError : ApiError
{
    public string? LocalizedMessage { get; set; }
    public int LanguageId { get; set; }

    public LocalizedApiError() : base()
    {
    }

    public LocalizedApiError(string code, int languageId) : base(code)
    {
        LanguageId = languageId;
    }

    public LocalizedApiError(string code, string message, int languageId) : base(code, message)
    {
        LocalizedMessage = message;
        LanguageId = languageId;
    }

    public LocalizedApiError(string code, string message, Dictionary<string, object> parameters, int languageId) 
        : base(code, message, parameters)
    {
        LocalizedMessage = message;
        LanguageId = languageId;
    }
}

/// <summary>
/// Localized API response with language support and selective field inclusion
/// </summary>
public class LocalizedApiResponse : ApiResponse
{
    public int LanguageId { get; set; }
    public new List<LocalizedApiError> Errors { get; set; } = [];
    public HashSet<string>? IncludeFields { get; set; }
    public HashSet<string>? ExcludeFields { get; set; }

    public LocalizedApiResponse() : base()
    {
    }

    public LocalizedApiResponse(int languageId) : base()
    {
        LanguageId = languageId;
    }

    public LocalizedApiResponse(object data, int languageId) : base(data)
    {
        LanguageId = languageId;
    }

    public LocalizedApiResponse(List<LocalizedApiError> errors, int languageId) : base()
    {
        Success = false;
        Errors = errors;
        LanguageId = languageId;
    }

    public LocalizedApiResponse(LocalizedApiError error, int languageId) : base()
    {
        Success = false;
        Errors = [error];
        LanguageId = languageId;
    }

    /// <summary>
    /// Include only specific fields in the response data
    /// </summary>
    public LocalizedApiResponse WithFields(params string[] fields)
    {
        IncludeFields = new HashSet<string>(fields);
        return this;
    }

    /// <summary>
    /// Exclude specific fields from the response data
    /// </summary>
    public LocalizedApiResponse WithoutFields(params string[] fields)
    {
        ExcludeFields = new HashSet<string>(fields);
        return this;
    }
}

/// <summary>
/// Generic localized API response with typed data
/// </summary>
/// <typeparam name="T">Type of the response data</typeparam>
public class LocalizedApiResponse<T> : LocalizedApiResponse
{
    public new T? Data { get; set; }

    public LocalizedApiResponse() : base()
    {
    }

    public LocalizedApiResponse(int languageId) : base(languageId)
    {
    }

    public LocalizedApiResponse(T data, int languageId) : base(languageId)
    {
        Success = true;
        Data = data;
    }

    public LocalizedApiResponse(List<LocalizedApiError> errors, int languageId) : base(errors, languageId)
    {
    }

    public LocalizedApiResponse(LocalizedApiError error, int languageId) : base(error, languageId)
    {
    }

    /// <summary>
    /// Include only specific fields in the response data
    /// </summary>
    public new LocalizedApiResponse<T> WithFields(params string[] fields)
    {
        IncludeFields = new HashSet<string>(fields);
        return this;
    }

    /// <summary>
    /// Exclude specific fields from the response data
    /// </summary>
    public new LocalizedApiResponse<T> WithoutFields(params string[] fields)
    {
        ExcludeFields = new HashSet<string>(fields);
        return this;
    }
}

/// <summary>
/// Paginated localized API response
/// </summary>
/// <typeparam name="T">Type of the items in the paginated response</typeparam>
public class LocalizedPaginatedApiResponse<T> : LocalizedApiResponse<PaginationData<T>>
{
    public LocalizedPaginatedApiResponse() : base()
    {
    }

    public LocalizedPaginatedApiResponse(int languageId) : base(languageId)
    {
    }

    public LocalizedPaginatedApiResponse(PaginatedResult<T> paginatedResult, int languageId) : base(languageId)
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

    public LocalizedPaginatedApiResponse(List<LocalizedApiError> errors, int languageId) : base(errors, languageId)
    {
    }

    public LocalizedPaginatedApiResponse(LocalizedApiError error, int languageId) : base(error, languageId)
    {
    }
}