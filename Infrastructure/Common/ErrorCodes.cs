namespace Infrastructure.Common;

/// <summary>
/// Centralized error codes for localized error messages
/// These codes will be used to retrieve localized messages from the database
/// </summary>
public static class ErrorCodes
{
    // General validation errors
    public const string VALIDATION_REQUIRED_FIELD = "ERR_001";
    public const string VALIDATION_INVALID_FORMAT = "ERR_002";
    public const string VALIDATION_OUT_OF_RANGE = "ERR_003";
    public const string VALIDATION_INVALID_LENGTH = "ERR_004";

    // Entity not found errors
    public const string ENTITY_NOT_FOUND = "ERR_101";
    public const string USER_NOT_FOUND = "ERR_102";
    public const string PRODUCT_NOT_FOUND = "ERR_103";
    public const string CATEGORY_NOT_FOUND = "ERR_104";
    public const string PROVIDER_NOT_FOUND = "ERR_105";
    public const string ORDER_NOT_FOUND = "ERR_106";
    public const string LOCATION_NOT_FOUND = "ERR_107";

    // Business logic errors
    public const string BUSINESS_INSUFFICIENT_QUANTITY = "ERR_201";
    public const string BUSINESS_PRODUCT_OUT_OF_STOCK = "ERR_202";
    public const string BUSINESS_INVALID_OPERATION = "ERR_203";
    public const string BUSINESS_CONSTRAINT_VIOLATION = "ERR_204";
    public const string BUSINESS_DUPLICATE_ENTRY = "ERR_205";

    // User-specific errors
    public const string USER_INVALID_ID = "ERR_301";
    public const string USER_EMAIL_REQUIRED = "ERR_302";
    public const string USER_PASSWORD_REQUIRED = "ERR_303";
    public const string USER_EMAIL_EXISTS = "ERR_304";
    public const string USER_INVALID_EMAIL_FORMAT = "ERR_305";
    public const string USER_HAS_DEPENDENCIES = "ERR_306";

    // Product-specific errors
    public const string PRODUCT_INVALID_ID = "ERR_401";
    public const string PRODUCT_NAME_REQUIRED = "ERR_402";
    public const string PRODUCT_INVALID_CATEGORY = "ERR_403";
    public const string PRODUCT_INVALID_PROVIDER = "ERR_404";
    public const string PRODUCT_INVALID_PRICE = "ERR_405";
    public const string PRODUCT_INVALID_QUANTITY = "ERR_406";

    // Order-specific errors
    public const string ORDER_INVALID_ID = "ERR_501";
    public const string ORDER_EMPTY_CART = "ERR_502";
    public const string ORDER_INVALID_ADDRESS = "ERR_503";
    public const string ORDER_PAYMENT_FAILED = "ERR_504";

    // Authorization errors
    public const string AUTH_UNAUTHORIZED = "ERR_601";
    public const string AUTH_FORBIDDEN = "ERR_602";
    public const string AUTH_INVALID_TOKEN = "ERR_603";
    public const string AUTH_TOKEN_EXPIRED = "ERR_604";

    // System errors
    public const string SYSTEM_DATABASE_ERROR = "ERR_701";
    public const string SYSTEM_EXTERNAL_SERVICE_ERROR = "ERR_702";
    public const string SYSTEM_TIMEOUT = "ERR_703";
    public const string SYSTEM_UNKNOWN_ERROR = "ERR_704";

    // Pagination errors
    public const string PAGINATION_INVALID_PAGE = "ERR_801";
    public const string PAGINATION_INVALID_PAGE_SIZE = "ERR_802";

    // Location errors
    public const string LOCATION_INVALID_ID = "ERR_901";
    public const string LOCATION_COORDINATES_INVALID = "ERR_902";
}

/// <summary>
/// Error code with additional context parameters
/// </summary>
public class ErrorDetail
{
    public string Code { get; set; } = string.Empty;
    public Dictionary<string, object> Parameters { get; set; } = new();

    public ErrorDetail() { }

    public ErrorDetail(string code)
    {
        Code = code;
    }

    public ErrorDetail(string code, Dictionary<string, object> parameters)
    {
        Code = code;
        Parameters = parameters;
    }

    public ErrorDetail WithParameter(string key, object value)
    {
        Parameters[key] = value;
        return this;
    }
}