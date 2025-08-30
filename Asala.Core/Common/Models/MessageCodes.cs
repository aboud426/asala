namespace Asala.Core.Common.Models;

/// <summary>
/// Centralized message codes for consistent error handling and localization
/// These codes will be used to retrieve localized messages from the database
/// </summary>
public static class MessageCodes
{
    // General execution errors
    public const string EXECUTION_ERROR = "EXECUTION_ERROR";

    // Database operation errors
    public const string DB_ERROR = "DB_ERROR";
    public const string CONCURRENCY_ERROR = "CONCURRENCY_ERROR";
    public const string DATABASE_UPDATE_ERROR = "DATABASE_UPDATE_ERROR";
    public const string SAVE_CHANGES_ERROR = "SAVE_CHANGES_ERROR";

    // Transaction management errors
    public const string TRANSACTION_ALREADY_EXISTS = "TRANSACTION_ALREADY_EXISTS";
    public const string TRANSACTION_BEGIN_ERROR = "TRANSACTION_BEGIN_ERROR";
    public const string NO_ACTIVE_TRANSACTION = "NO_ACTIVE_TRANSACTION";
    public const string TRANSACTION_COMMIT_ERROR = "TRANSACTION_COMMIT_ERROR";
    public const string TRANSACTION_ROLLBACK_ERROR = "TRANSACTION_ROLLBACK_ERROR";

    // Entity validation errors
    public const string ENTITY_NULL = "ENTITY_NULL";
    public const string ENTITY_NOT_FOUND = "ENTITY_NOT_FOUND";
    public const string ENTITIES_NULL_OR_EMPTY = "ENTITIES_NULL_OR_EMPTY";

    // Language-specific errors
    public const string LANGUAGE_NOT_FOUND = "LANGUAGE_NOT_FOUND";
    public const string LANGUAGE_CODE_ALREADY_EXISTS = "LANGUAGE_CODE_ALREADY_EXISTS";
    
    // Language validation errors
    public const string LANGUAGE_NAME_REQUIRED = "LANGUAGE_NAME_REQUIRED";
    public const string LANGUAGE_NAME_TOO_LONG = "LANGUAGE_NAME_TOO_LONG";
    public const string LANGUAGE_CODE_REQUIRED = "LANGUAGE_CODE_REQUIRED";
    public const string LANGUAGE_CODE_INVALID_FORMAT = "LANGUAGE_CODE_INVALID_FORMAT";
    public const string LANGUAGE_CODE_TOO_LONG = "LANGUAGE_CODE_TOO_LONG";
    public const string LANGUAGE_ID_INVALID = "LANGUAGE_ID_INVALID";
    public const string PAGINATION_INVALID_PAGE = "PAGINATION_INVALID_PAGE";
    public const string PAGINATION_INVALID_PAGE_SIZE = "PAGINATION_INVALID_PAGE_SIZE";

    // System errors
    public const string INTERNAL_ERROR = "INTERNAL_ERROR";

    // Success messages
    public const string WELCOME_MESSAGE = "WELCOME_MESSAGE";
}
