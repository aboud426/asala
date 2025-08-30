using Microsoft.AspNetCore.Mvc;
using Infrastructure.Common;
using Presentation.Models;
using Business.Services;
using System.Reflection;

namespace Presentation.Extensions;

/// <summary>
/// Extension methods to convert Result objects to API responses
/// </summary>
public static class ResultExtensions
{
    /// <summary>
    /// Converts a Result to an ApiResponse
    /// </summary>
    public static ApiResponse ToApiResponse(this Result result)
    {
        if (result.IsSuccess)
        {
            return new ApiResponse(success: true);
        }

        var errors = result.Errors.Select(e => new ApiError
        {
            Code = e.Code,
            Parameters = e.Parameters
        }).ToList();

        return new ApiResponse(errors);
    }

    /// <summary>
    /// Converts a Result<T> to an ApiResponse<T>
    /// </summary>
    public static ApiResponse<T> ToApiResponse<T>(this Result<T> result)
    {
        if (result.IsSuccess)
        {
            return new ApiResponse<T>(result.Value!);
        }

        var errors = result.Errors.Select(e => new ApiError
        {
            Code = e.Code,
            Parameters = e.Parameters
        }).ToList();

        return new ApiResponse<T>(errors);
    }

    /// <summary>
    /// Converts a paginated result to a PaginatedApiResponse
    /// </summary>
    public static PaginatedApiResponse<T> ToPaginatedApiResponse<T>(this Result<PaginatedResult<T>> result)
    {
        if (result.IsSuccess)
        {
            return new PaginatedApiResponse<T>(result.Value!);
        }

        var errors = result.Errors.Select(e => new ApiError
        {
            Code = e.Code,
            Parameters = e.Parameters
        }).ToList();

        return new PaginatedApiResponse<T>(errors);
    }

    /// <summary>
    /// Converts a Result to an IActionResult for controllers
    /// </summary>
    public static IActionResult ToActionResult(this Result result)
    {
        var apiResponse = result.ToApiResponse();
        
        if (result.IsSuccess)
        {
            return new OkObjectResult(apiResponse);
        }

        // Determine HTTP status code based on error codes
        var httpStatusCode = GetHttpStatusCode(result.Error?.Code);
        return new ObjectResult(apiResponse)
        {
            StatusCode = httpStatusCode
        };
    }

    /// <summary>
    /// Converts a Result<T> to an IActionResult for controllers
    /// </summary>
    public static IActionResult ToActionResult<T>(this Result<T> result)
    {
        var apiResponse = result.ToApiResponse();
        
        if (result.IsSuccess)
        {
            if (result.Value == null)
            {
                return new NotFoundObjectResult(new ApiResponse(new ApiError(ErrorCodes.ENTITY_NOT_FOUND)));
            }
            
            return new OkObjectResult(apiResponse);
        }

        // Determine HTTP status code based on error codes
        var httpStatusCode = GetHttpStatusCode(result.Error?.Code);
        return new ObjectResult(apiResponse)
        {
            StatusCode = httpStatusCode
        };
    }

    /// <summary>
    /// Converts a paginated result to an IActionResult for controllers
    /// </summary>
    public static IActionResult ToActionResult<T>(this Result<PaginatedResult<T>> result)
    {
        var apiResponse = result.ToPaginatedApiResponse();
        
        if (result.IsSuccess)
        {
            return new OkObjectResult(apiResponse);
        }

        // Determine HTTP status code based on error codes
        var httpStatusCode = GetHttpStatusCode(result.Error?.Code);
        return new ObjectResult(apiResponse)
        {
            StatusCode = httpStatusCode
        };
    }

    /// <summary>
    /// Maps error codes to HTTP status codes
    /// </summary>
    private static int GetHttpStatusCode(string? errorCode)
    {
        return errorCode switch
        {
            // 400 Bad Request - Validation errors
            var code when code?.StartsWith("ERR_001") == true => 400, // Required field
            var code when code?.StartsWith("ERR_002") == true => 400, // Invalid format
            var code when code?.StartsWith("ERR_003") == true => 400, // Out of range
            var code when code?.StartsWith("ERR_004") == true => 400, // Invalid length
            var code when code?.StartsWith("ERR_3") == true => 400,   // User validation errors
            var code when code?.StartsWith("ERR_4") == true => 400,   // Product validation errors
            var code when code?.StartsWith("ERR_8") == true => 400,   // Pagination errors

            // 404 Not Found - Entity not found errors
            var code when code?.StartsWith("ERR_10") == true => 404,  // Entity not found errors

            // 401 Unauthorized - Auth errors
            ErrorCodes.AUTH_UNAUTHORIZED => 401,
            ErrorCodes.AUTH_INVALID_TOKEN => 401,

            // 403 Forbidden - Auth errors
            ErrorCodes.AUTH_FORBIDDEN => 403,

            // 409 Conflict - Business logic errors
            var code when code?.StartsWith("ERR_2") == true => 409,   // Business logic errors
            ErrorCodes.USER_EMAIL_EXISTS => 409,
            ErrorCodes.BUSINESS_DUPLICATE_ENTRY => 409,

            // 422 Unprocessable Entity - Business constraint violations
            ErrorCodes.BUSINESS_CONSTRAINT_VIOLATION => 422,
            ErrorCodes.USER_HAS_DEPENDENCIES => 422,

            // 500 Internal Server Error - System errors
            var code when code?.StartsWith("ERR_7") == true => 500,   // System errors

            // Default to 400 for unknown errors
            _ => 400
        };
    }

    /// <summary>
    /// Converts a Result to a LocalizedApiResponse with message localization
    /// </summary>
    public static async Task<LocalizedApiResponse> ToLocalizedApiResponseAsync(
        this Result result, 
        int languageId, 
        IMessageService messageService,
        string[]? includeFields = null,
        string[]? excludeFields = null)
    {
        if (result.IsSuccess)
        {
            var response = new LocalizedApiResponse(languageId);
            if (includeFields != null) response.WithFields(includeFields);
            if (excludeFields != null) response.WithoutFields(excludeFields);
            return response;
        }

        var localizedErrors = new List<LocalizedApiError>();
        
        foreach (var error in result.Errors)
        {
            var localizedError = new LocalizedApiError(error.Code, languageId)
            {
                Parameters = error.Parameters
            };

            // Try to get localized message
            var messageResult = await messageService.GetLocalizedMessageAsync(error.Code, languageId);
            if (messageResult.IsSuccess && !string.IsNullOrEmpty(messageResult.Value))
            {
                localizedError.LocalizedMessage = messageResult.Value;
            }

            localizedErrors.Add(localizedError);
        }

        var errorResponse = new LocalizedApiResponse(localizedErrors, languageId);
        if (includeFields != null) errorResponse.WithFields(includeFields);
        if (excludeFields != null) errorResponse.WithoutFields(excludeFields);
        return errorResponse;
    }

    /// <summary>
    /// Converts a Result<T> to a LocalizedApiResponse<T> with message localization
    /// </summary>
    public static async Task<LocalizedApiResponse<T>> ToLocalizedApiResponseAsync<T>(
        this Result<T> result, 
        int languageId, 
        IMessageService messageService,
        string[]? includeFields = null,
        string[]? excludeFields = null)
    {
        if (result.IsSuccess)
        {
            var filteredData = FilterObject(result.Value, includeFields, excludeFields);
            var response = new LocalizedApiResponse<T>((T)filteredData!, languageId);
            if (includeFields != null) response.WithFields(includeFields);
            if (excludeFields != null) response.WithoutFields(excludeFields);
            return response;
        }

        var localizedErrors = new List<LocalizedApiError>();
        
        foreach (var error in result.Errors)
        {
            var localizedError = new LocalizedApiError(error.Code, languageId)
            {
                Parameters = error.Parameters
            };

            // Try to get localized message
            var messageResult = await messageService.GetLocalizedMessageAsync(error.Code, languageId);
            if (messageResult.IsSuccess && !string.IsNullOrEmpty(messageResult.Value))
            {
                localizedError.LocalizedMessage = messageResult.Value;
            }

            localizedErrors.Add(localizedError);
        }

        var errorResponse = new LocalizedApiResponse<T>(localizedErrors, languageId);
        if (includeFields != null) errorResponse.WithFields(includeFields);
        if (excludeFields != null) errorResponse.WithoutFields(excludeFields);
        return errorResponse;
    }

    /// <summary>
    /// Converts a paginated result to a LocalizedPaginatedApiResponse with message localization
    /// </summary>
    public static async Task<LocalizedPaginatedApiResponse<T>> ToLocalizedPaginatedApiResponseAsync<T>(
        this Result<PaginatedResult<T>> result, 
        int languageId, 
        IMessageService messageService,
        string[]? includeFields = null,
        string[]? excludeFields = null)
    {
        if (result.IsSuccess)
        {
            var filteredItems = result.Value!.Items
                .Select(item => (T)FilterObject(item, includeFields, excludeFields)!)
                .ToList();

            var filteredResult = new PaginatedResult<T>(
                filteredItems,
                result.Value.TotalCount,
                result.Value.Page,
                result.Value.PageSize
            );

            var response = new LocalizedPaginatedApiResponse<T>(filteredResult, languageId);
            if (includeFields != null) response.WithFields(includeFields);
            if (excludeFields != null) response.WithoutFields(excludeFields);
            return response;
        }

        var localizedErrors = new List<LocalizedApiError>();
        
        foreach (var error in result.Errors)
        {
            var localizedError = new LocalizedApiError(error.Code, languageId)
            {
                Parameters = error.Parameters
            };

            // Try to get localized message
            var messageResult = await messageService.GetLocalizedMessageAsync(error.Code, languageId);
            if (messageResult.IsSuccess && !string.IsNullOrEmpty(messageResult.Value))
            {
                localizedError.LocalizedMessage = messageResult.Value;
            }

            localizedErrors.Add(localizedError);
        }

        var errorResponse = new LocalizedPaginatedApiResponse<T>(localizedErrors, languageId);
        if (includeFields != null) errorResponse.WithFields(includeFields);
        if (excludeFields != null) errorResponse.WithoutFields(excludeFields);
        return errorResponse;
    }

    /// <summary>
    /// Converts a LocalizedApiResponse to an IActionResult for controllers
    /// </summary>
    public static IActionResult ToActionResult(this LocalizedApiResponse response)
    {
        if (response.Success)
        {
            return new OkObjectResult(response);
        }

        // Determine HTTP status code based on error codes
        var httpStatusCode = GetHttpStatusCode(response.Errors.FirstOrDefault()?.Code);
        return new ObjectResult(response)
        {
            StatusCode = httpStatusCode
        };
    }

    /// <summary>
    /// Converts a LocalizedApiResponse<T> to an IActionResult for controllers
    /// </summary>
    public static IActionResult ToActionResult<T>(this LocalizedApiResponse<T> response)
    {
        if (response.Success)
        {
            if (response.Data == null)
            {
                var notFoundError = new LocalizedApiError(ErrorCodes.ENTITY_NOT_FOUND, response.LanguageId);
                var notFoundResponse = new LocalizedApiResponse<T>(notFoundError, response.LanguageId);
                return new NotFoundObjectResult(notFoundResponse);
            }
            
            return new OkObjectResult(response);
        }

        // Determine HTTP status code based on error codes
        var httpStatusCode = GetHttpStatusCode(response.Errors.FirstOrDefault()?.Code);
        return new ObjectResult(response)
        {
            StatusCode = httpStatusCode
        };
    }

    /// <summary>
    /// Filters object properties based on include/exclude field lists
    /// </summary>
    private static object FilterObject(object? obj, string[]? includeFields, string[]? excludeFields)
    {
        if (obj == null) return obj!;

        // If no filtering is specified, return original object
        if ((includeFields == null || includeFields.Length == 0) && 
            (excludeFields == null || excludeFields.Length == 0))
        {
            return obj;
        }

        var objType = obj.GetType();
        
        // For primitive types and strings, return as-is
        if (objType.IsPrimitive || objType == typeof(string) || objType == typeof(DateTime) || 
            objType == typeof(Guid) || objType == typeof(decimal))
        {
            return obj;
        }

        // Create anonymous object with filtered properties
        var properties = objType.GetProperties(BindingFlags.Public | BindingFlags.Instance);
        var filteredProps = new Dictionary<string, object?>();

        foreach (var prop in properties)
        {
            var propName = prop.Name;
            
            // Apply include filter
            if (includeFields != null && includeFields.Length > 0)
            {
                if (!includeFields.Contains(propName, StringComparer.OrdinalIgnoreCase))
                    continue;
            }
            
            // Apply exclude filter
            if (excludeFields != null && excludeFields.Length > 0)
            {
                if (excludeFields.Contains(propName, StringComparer.OrdinalIgnoreCase))
                    continue;
            }

            var propValue = prop.GetValue(obj);
            filteredProps[propName] = propValue;
        }

        // Create new object with filtered properties
        var filteredType = obj.GetType();
        var filteredObj = Activator.CreateInstance(filteredType);
        
        foreach (var kvp in filteredProps)
        {
            var prop = filteredType.GetProperty(kvp.Key);
            if (prop != null && prop.CanWrite)
            {
                prop.SetValue(filteredObj, kvp.Value);
            }
        }

        return filteredObj!;
    }
}