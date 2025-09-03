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

    // Message-specific errors
    public const string MESSAGE_NOT_FOUND = "MESSAGE_NOT_FOUND";
    public const string MESSAGE_ID_INVALID = "MESSAGE_ID_INVALID";
    public const string MESSAGE_KEY_REQUIRED = "MESSAGE_KEY_REQUIRED";
    public const string MESSAGE_KEY_TOO_LONG = "MESSAGE_KEY_TOO_LONG";
    public const string MESSAGE_KEY_ALREADY_EXISTS = "MESSAGE_KEY_ALREADY_EXISTS";
    public const string MESSAGE_DEFAULT_TEXT_REQUIRED = "MESSAGE_DEFAULT_TEXT_REQUIRED";
    public const string MESSAGE_DEFAULT_TEXT_TOO_LONG = "MESSAGE_DEFAULT_TEXT_TOO_LONG";
    public const string MESSAGE_LOCALIZED_KEY_REQUIRED = "MESSAGE_LOCALIZED_KEY_REQUIRED";
    public const string MESSAGE_LOCALIZED_TEXT_REQUIRED = "MESSAGE_LOCALIZED_TEXT_REQUIRED";
    public const string MESSAGE_LOCALIZED_TEXT_TOO_LONG = "MESSAGE_LOCALIZED_TEXT_TOO_LONG";
    public const string MESSAGE_LOCALIZED_LANGUAGE_ID_INVALID = "MESSAGE_LOCALIZED_LANGUAGE_ID_INVALID";

    // System errors
    public const string INTERNAL_ERROR = "INTERNAL_ERROR";

    // User-specific errors
    public const string USER_NOT_FOUND = "USER_NOT_FOUND";
    public const string USER_ID_INVALID = "USER_ID_INVALID";
    public const string USER_EMAIL_REQUIRED = "USER_EMAIL_REQUIRED";
    public const string USER_EMAIL_INVALID_FORMAT = "USER_EMAIL_INVALID_FORMAT";
    public const string USER_EMAIL_TOO_LONG = "USER_EMAIL_TOO_LONG";
    public const string USER_EMAIL_ALREADY_EXISTS = "USER_EMAIL_ALREADY_EXISTS";
    public const string USER_PASSWORD_REQUIRED = "USER_PASSWORD_REQUIRED";
    public const string USER_PASSWORD_TOO_SHORT = "USER_PASSWORD_TOO_SHORT";
    public const string USER_PASSWORD_TOO_LONG = "USER_PASSWORD_TOO_LONG";
    public const string USER_CURRENT_PASSWORD_INVALID = "USER_CURRENT_PASSWORD_INVALID";

    // Role-specific errors
    public const string ROLE_NOT_FOUND = "ROLE_NOT_FOUND";
    public const string ROLE_ID_INVALID = "ROLE_ID_INVALID";
    public const string ROLE_NAME_REQUIRED = "ROLE_NAME_REQUIRED";
    public const string ROLE_NAME_TOO_LONG = "ROLE_NAME_TOO_LONG";
    public const string ROLE_NAME_ALREADY_EXISTS = "ROLE_NAME_ALREADY_EXISTS";

    // Permission-specific errors
    public const string PERMISSION_NOT_FOUND = "PERMISSION_NOT_FOUND";
    public const string PERMISSION_ID_INVALID = "PERMISSION_ID_INVALID";
    public const string PERMISSION_NAME_REQUIRED = "PERMISSION_NAME_REQUIRED";
    public const string PERMISSION_NAME_TOO_LONG = "PERMISSION_NAME_TOO_LONG";
    public const string PERMISSION_NAME_ALREADY_EXISTS = "PERMISSION_NAME_ALREADY_EXISTS";

    // Customer-specific errors
    public const string CUSTOMER_NOT_FOUND = "CUSTOMER_NOT_FOUND";
    public const string CUSTOMER_NAME_REQUIRED = "CUSTOMER_NAME_REQUIRED";
    public const string CUSTOMER_NAME_TOO_LONG = "CUSTOMER_NAME_TOO_LONG";
    public const string CUSTOMER_ADDRESS_ID_INVALID = "CUSTOMER_ADDRESS_ID_INVALID";

    // Employee-specific errors
    public const string EMPLOYEE_NOT_FOUND = "EMPLOYEE_NOT_FOUND";
    public const string EMPLOYEE_NAME_REQUIRED = "EMPLOYEE_NAME_REQUIRED";
    public const string EMPLOYEE_NAME_TOO_LONG = "EMPLOYEE_NAME_TOO_LONG";

    // Success messages
    public const string WELCOME_MESSAGE = "WELCOME_MESSAGE";
}
