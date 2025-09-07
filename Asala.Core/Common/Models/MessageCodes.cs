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
    public const string MESSAGE_LOCALIZED_LANGUAGE_ID_INVALID =
        "MESSAGE_LOCALIZED_LANGUAGE_ID_INVALID";

    // General validation errors
    public const string INVALID_ID = "INVALID_ID";
    public const string INVALID_USER_ID = "INVALID_USER_ID";

    // Post-specific errors
    public const string POST_NOT_FOUND = "POST_NOT_FOUND";
    public const string POST_ID_INVALID = "POST_ID_INVALID";
    public const string POST_USER_ID_REQUIRED = "POST_USER_ID_REQUIRED";
    public const string POST_DESCRIPTION_TOO_LONG = "POST_DESCRIPTION_TOO_LONG";

    // PostType-specific errors
    public const string POSTTYPE_NOT_FOUND = "POSTTYPE_NOT_FOUND";
    public const string POSTTYPE_ID_INVALID = "POSTTYPE_ID_INVALID";
    public const string POSTTYPE_NAME_REQUIRED = "POSTTYPE_NAME_REQUIRED";
    public const string POSTTYPE_NAME_TOO_LONG = "POSTTYPE_NAME_TOO_LONG";
    public const string POSTTYPE_NAME_ALREADY_EXISTS = "POSTTYPE_NAME_ALREADY_EXISTS";
    public const string POSTTYPE_DESCRIPTION_REQUIRED = "POSTTYPE_DESCRIPTION_REQUIRED";
    public const string POSTTYPE_DESCRIPTION_TOO_LONG = "POSTTYPE_DESCRIPTION_TOO_LONG";
    public const string POSTTYPE_LOCALIZED_NAME_REQUIRED = "POSTTYPE_LOCALIZED_NAME_REQUIRED";
    public const string POSTTYPE_LOCALIZED_NAME_TOO_LONG = "POSTTYPE_LOCALIZED_NAME_TOO_LONG";
    public const string POSTTYPE_LOCALIZED_DESCRIPTION_REQUIRED = "POSTTYPE_LOCALIZED_DESCRIPTION_REQUIRED";
    public const string POSTTYPE_LOCALIZED_DESCRIPTION_TOO_LONG = "POSTTYPE_LOCALIZED_DESCRIPTION_TOO_LONG";
    public const string POSTTYPE_LOCALIZED_LANGUAGE_ID_INVALID = "POSTTYPE_LOCALIZED_LANGUAGE_ID_INVALID";

    // Product-specific errors
    public const string PRODUCT_NOT_FOUND = "PRODUCT_NOT_FOUND";
    public const string PRODUCT_ID_INVALID = "PRODUCT_ID_INVALID";
    public const string PRODUCT_NAME_REQUIRED = "PRODUCT_NAME_REQUIRED";
    public const string PRODUCT_NAME_TOO_LONG = "PRODUCT_NAME_TOO_LONG";
    public const string PRODUCT_PRICE_INVALID = "PRODUCT_PRICE_INVALID";
    public const string PRODUCT_QUANTITY_INVALID = "PRODUCT_QUANTITY_INVALID";
    public const string PRODUCT_CATEGORY_ID_REQUIRED = "PRODUCT_CATEGORY_ID_REQUIRED";
    public const string PRODUCT_PROVIDER_ID_REQUIRED = "PRODUCT_PROVIDER_ID_REQUIRED";

    // Media-specific errors
    public const string MEDIA_NOT_FOUND = "MEDIA_NOT_FOUND";
    public const string MEDIA_URL_REQUIRED = "MEDIA_URL_REQUIRED";
    public const string MEDIA_URL_INVALID = "MEDIA_URL_INVALID";

    // System errors
    public const string INTERNAL_ERROR = "INTERNAL_ERROR";
    public const string NOT_IMPLEMENTED = "NOT_IMPLEMENTED";

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
    public const string USER_PHONE_NUMBER_ALREADY_EXISTS = "USER_PHONE_NUMBER_ALREADY_EXISTS";

    // Role-specific errors
    public const string ROLE_NOT_FOUND = "ROLE_NOT_FOUND";
    public const string ROLE_ID_INVALID = "ROLE_ID_INVALID";
    public const string ROLE_NAME_REQUIRED = "ROLE_NAME_REQUIRED";
    public const string ROLE_NAME_TOO_LONG = "ROLE_NAME_TOO_LONG";
    public const string ROLE_NAME_ALREADY_EXISTS = "ROLE_NAME_ALREADY_EXISTS";
    public const string ROLE_DESCRIPTION_TOO_LONG = "ROLE_DESCRIPTION_TOO_LONG";
    public const string ROLE_LOCALIZED_NAME_REQUIRED = "ROLE_LOCALIZED_NAME_REQUIRED";
    public const string ROLE_LOCALIZED_NAME_TOO_LONG = "ROLE_LOCALIZED_NAME_TOO_LONG";
    public const string ROLE_LOCALIZED_DESCRIPTION_TOO_LONG = "ROLE_LOCALIZED_DESCRIPTION_TOO_LONG";
    public const string ROLE_LOCALIZED_LANGUAGE_ID_INVALID = "ROLE_LOCALIZED_LANGUAGE_ID_INVALID";

    // Permission-specific errors
    public const string PERMISSION_NOT_FOUND = "PERMISSION_NOT_FOUND";
    public const string PERMISSION_ID_INVALID = "PERMISSION_ID_INVALID";
    public const string PERMISSION_NAME_REQUIRED = "PERMISSION_NAME_REQUIRED";
    public const string PERMISSION_NAME_TOO_LONG = "PERMISSION_NAME_TOO_LONG";
    public const string PERMISSION_NAME_ALREADY_EXISTS = "PERMISSION_NAME_ALREADY_EXISTS";
    public const string PERMISSION_DESCRIPTION_TOO_LONG = "PERMISSION_DESCRIPTION_TOO_LONG";
    public const string PERMISSION_LOCALIZED_NAME_REQUIRED = "PERMISSION_LOCALIZED_NAME_REQUIRED";
    public const string PERMISSION_LOCALIZED_NAME_TOO_LONG = "PERMISSION_LOCALIZED_NAME_TOO_LONG";
    public const string PERMISSION_LOCALIZED_DESCRIPTION_TOO_LONG =
        "PERMISSION_LOCALIZED_DESCRIPTION_TOO_LONG";
    public const string PERMISSION_LOCALIZED_LANGUAGE_ID_INVALID =
        "PERMISSION_LOCALIZED_LANGUAGE_ID_INVALID";

    // Currency-specific errors
    public const string CURRENCY_NOT_FOUND = "CURRENCY_NOT_FOUND";
    public const string CURRENCY_ID_INVALID = "CURRENCY_ID_INVALID";
    public const string CURRENCY_NAME_REQUIRED = "CURRENCY_NAME_REQUIRED";
    public const string CURRENCY_NAME_TOO_LONG = "CURRENCY_NAME_TOO_LONG";
    public const string CURRENCY_NAME_ALREADY_EXISTS = "CURRENCY_NAME_ALREADY_EXISTS";
    public const string CURRENCY_CODE_REQUIRED = "CURRENCY_CODE_REQUIRED";
    public const string CURRENCY_CODE_TOO_LONG = "CURRENCY_CODE_TOO_LONG";
    public const string CURRENCY_CODE_ALREADY_EXISTS = "CURRENCY_CODE_ALREADY_EXISTS";
    public const string CURRENCY_SYMBOL_REQUIRED = "CURRENCY_SYMBOL_REQUIRED";
    public const string CURRENCY_SYMBOL_TOO_LONG = "CURRENCY_SYMBOL_TOO_LONG";
    public const string CURRENCY_LOCALIZED_NAME_REQUIRED = "CURRENCY_LOCALIZED_NAME_REQUIRED";
    public const string CURRENCY_LOCALIZED_NAME_TOO_LONG = "CURRENCY_LOCALIZED_NAME_TOO_LONG";
    public const string CURRENCY_LOCALIZED_CODE_REQUIRED = "CURRENCY_LOCALIZED_CODE_REQUIRED";
    public const string CURRENCY_LOCALIZED_CODE_TOO_LONG = "CURRENCY_LOCALIZED_CODE_TOO_LONG";
    public const string CURRENCY_LOCALIZED_SYMBOL_REQUIRED = "CURRENCY_LOCALIZED_SYMBOL_REQUIRED";
    public const string CURRENCY_LOCALIZED_SYMBOL_TOO_LONG = "CURRENCY_LOCALIZED_SYMBOL_TOO_LONG";
    public const string CURRENCY_LOCALIZED_LANGUAGE_ID_INVALID = "CURRENCY_LOCALIZED_LANGUAGE_ID_INVALID";

    // Customer-specific errors
    public const string CUSTOMER_NOT_FOUND = "CUSTOMER_NOT_FOUND";
    public const string CUSTOMER_NAME_REQUIRED = "CUSTOMER_NAME_REQUIRED";
    public const string CUSTOMER_NAME_TOO_LONG = "CUSTOMER_NAME_TOO_LONG";
    public const string CUSTOMER_ADDRESS_ID_INVALID = "CUSTOMER_ADDRESS_ID_INVALID";

    // Employee-specific errors
    public const string EMPLOYEE_NOT_FOUND = "EMPLOYEE_NOT_FOUND";
    public const string EMPLOYEE_NAME_REQUIRED = "EMPLOYEE_NAME_REQUIRED";
    public const string EMPLOYEE_NAME_TOO_LONG = "EMPLOYEE_NAME_TOO_LONG";

    // Image upload errors
    public const string IMAGE_FILE_REQUIRED = "IMAGE_FILE_REQUIRED";
    public const string IMAGE_FILE_TOO_LARGE = "IMAGE_FILE_TOO_LARGE";
    public const string IMAGE_INVALID_FORMAT = "IMAGE_INVALID_FORMAT";
    public const string IMAGE_UPLOAD_ERROR = "IMAGE_UPLOAD_ERROR";
    public const string IMAGE_DIRECTORY_CREATE_ERROR = "IMAGE_DIRECTORY_CREATE_ERROR";

    // RolePermission-specific errors
    public const string ROLE_PERMISSION_NOT_FOUND = "ROLE_PERMISSION_NOT_FOUND";
    public const string ROLE_PERMISSION_ALREADY_EXISTS = "ROLE_PERMISSION_ALREADY_EXISTS";

    // General validation errors
    public const string FIELD_REQUIRED = "FIELD_REQUIRED";
    public const string INVALID_INPUT = "INVALID_INPUT";

    // Success messages
    public const string WELCOME_MESSAGE = "WELCOME_MESSAGE";
    public const string IMAGE_UPLOADED_SUCCESSFULLY = "IMAGE_UPLOADED_SUCCESSFULLY";

    public static string PERMISSION_PAGE_REQUIRED = "PERMISSION_PAGE_REQUIRED";
    public static string PERMISSION_PAGE_TOO_LONG = "PERMISSION_PAGE_TOO_LONG";
}
