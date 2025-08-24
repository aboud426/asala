using Infrastructure.Common;

namespace Business.Common;

/// <summary>
/// Example demonstrating how localization works with error codes
/// This shows the complete flow from error codes to localized messages
/// </summary>
public class LocalizationExample
{
    /// <summary>
    /// Example of how the API response would look with error codes
    /// The frontend/client will use these codes to get localized messages from the database
    /// </summary>
    public static void ExampleApiResponses()
    {
        // Example 1: Validation error
        var validationError = new
        {
            success = false,
            errors = new[]
            {
                new
                {
                    code = "ERR_402", // PRODUCT_NAME_REQUIRED
                    parameters = new { field = "name" }
                }
            }
        };

        // Example 2: Business logic error with parameters
        var businessError = new
        {
            success = false,
            errors = new[]
            {
                new
                {
                    code = "ERR_201", // BUSINESS_INSUFFICIENT_QUANTITY
                    parameters = new 
                    { 
                        productId = 123,
                        requested = 10,
                        available = 5
                    }
                }
            }
        };

        // Example 3: Success response
        var successResponse = new
        {
            success = true,
            data = new
            {
                id = 123,
                name = "Sample Product",
                price = 29.99
            }
        };
    }

    /// <summary>
    /// Example of how the client-side localization would work
    /// </summary>
    public static class ClientSideLocalization
    {
        /// <summary>
        /// Example: Frontend receives API response and translates error codes
        /// 
        /// 1. API returns: { "success": false, "errors": [{ "code": "ERR_402" }] }
        /// 2. Frontend looks up "ERR_402" in localization table/service
        /// 3. Frontend displays localized message to user
        /// </summary>
        public const string ExampleFlow = @"
            API Response:
            {
                ""success"": false,
                ""errors"": [{
                    ""code"": ""ERR_402"",
                    ""parameters"": { ""field"": ""name"" }
                }]
            }

            Frontend Localization:
            - English: ""Product name is required""
            - Spanish: ""El nombre del producto es obligatorio""
            - French: ""Le nom du produit est requis""
            - Arabic: ""اسم المنتج مطلوب""
        ";

        /// <summary>
        /// Example database structure for localized error messages
        /// </summary>
        public const string DatabaseSchema = @"
            CREATE TABLE ErrorMessages (
                ErrorCode NVARCHAR(10) NOT NULL,
                Language NVARCHAR(10) NOT NULL,
                Message NVARCHAR(500) NOT NULL,
                PRIMARY KEY (ErrorCode, Language)
            );

            INSERT INTO ErrorMessages VALUES
            ('ERR_402', 'en', 'Product name is required'),
            ('ERR_402', 'es', 'El nombre del producto es obligatorio'),
            ('ERR_402', 'fr', 'Le nom du produit est requis'),
            ('ERR_402', 'ar', 'اسم المنتج مطلوب');
        ";

        /// <summary>
        /// Example of frontend service to get localized messages
        /// </summary>
        public const string FrontendService = @"
            // Frontend service example
            class LocalizationService {
                async getLocalizedMessage(errorCode, language, parameters) {
                    const response = await fetch(`/api/localization/${errorCode}/${language}`);
                    const data = await response.json();
                    
                    let message = data.message;
                    
                    // Replace parameters in message template
                    if (parameters) {
                        Object.keys(parameters).forEach(key => {
                            message = message.replace(`{${key}}`, parameters[key]);
                        });
                    }
                    
                    return message;
                }
            }
        ";
    }

    /// <summary>
    /// Example of error code usage in different scenarios
    /// </summary>
    public static class ErrorCodeUsageExamples
    {
        /// <summary>
        /// Simple validation error - no parameters needed
        /// </summary>
        public static Result<Infrastructure.Models.Product> RequiredFieldError()
        {
            return Result.Failure<Infrastructure.Models.Product>(ErrorCodes.PRODUCT_NAME_REQUIRED);
        }

        /// <summary>
        /// Business logic error with parameters for context
        /// </summary>
        public static Result<Infrastructure.Models.Product> InsufficientQuantityError(int productId, int requested, int available)
        {
            var error = new ErrorDetail(ErrorCodes.BUSINESS_INSUFFICIENT_QUANTITY)
                .WithParameter("productId", productId)
                .WithParameter("requested", requested)
                .WithParameter("available", available);
            
            return Result.Failure<Infrastructure.Models.Product>(error);
        }

        /// <summary>
        /// Multiple validation errors
        /// </summary>
        public static Result<Infrastructure.Models.Product> MultipleValidationErrors()
        {
            var errors = new List<ErrorDetail>
            {
                new ErrorDetail(ErrorCodes.PRODUCT_NAME_REQUIRED),
                new ErrorDetail(ErrorCodes.PRODUCT_INVALID_PRICE).WithParameter("value", -10),
                new ErrorDetail(ErrorCodes.PRODUCT_INVALID_CATEGORY).WithParameter("categoryId", 0)
            };
            
            return Result.Failure<Infrastructure.Models.Product>(errors);
        }
    }

    /// <summary>
    /// Example of how different HTTP status codes are mapped from error codes
    /// </summary>
    public static class HttpStatusMapping
    {
        public const string Examples = @"
            Error Code Patterns → HTTP Status:
            
            ERR_001-ERR_004 (Validation) → 400 Bad Request
            ERR_3xx (User validation) → 400 Bad Request  
            ERR_4xx (Product validation) → 400 Bad Request
            ERR_8xx (Pagination) → 400 Bad Request
            
            ERR_10x (Not Found) → 404 Not Found
            ERR_102 (User not found) → 404 Not Found
            ERR_103 (Product not found) → 404 Not Found
            
            ERR_2xx (Business logic) → 409 Conflict
            ERR_205 (Duplicate entry) → 409 Conflict
            
            ERR_204 (Constraint violation) → 422 Unprocessable Entity
            ERR_306 (User has dependencies) → 422 Unprocessable Entity
            
            ERR_601 (Unauthorized) → 401 Unauthorized
            ERR_602 (Forbidden) → 403 Forbidden
            
            ERR_7xx (System errors) → 500 Internal Server Error
        ";
    }
}

