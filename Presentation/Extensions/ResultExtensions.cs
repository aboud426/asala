using Microsoft.AspNetCore.Mvc;
using Infrastructure.Common;
using Presentation.Models;

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
}