namespace Business.Common;

/// <summary>
/// Centralized cache key definitions to avoid magic strings
/// </summary>
public static class CacheKeys
{
    public const string ALL_PRODUCTS = "all_products";
    public const string ALL_CATEGORIES = "all_categories";
    public const string ALL_USERS = "all_users";
    public const string ALL_MESSAGES = "all_messages";
    public const string ALL_LANGUAGES = "all_languages";
    
    public static string Product(int id) => $"product_{id}";
    public static string ProductsByCategory(int categoryId) => $"products_category_{categoryId}";
    public static string ProductsByProvider(int providerId) => $"products_provider_{providerId}";
    public static string User(int id) => $"user_{id}";
    public static string Category(int id) => $"category_{id}";
    public static string ProductsPaginated(int page, int pageSize, string? filter = null) 
        => $"products_page_{page}_size_{pageSize}" + (string.IsNullOrEmpty(filter) ? "" : $"_filter_{filter}");
    
    public static string Message(int id) => $"message_{id}";
    public static string MessageByCode(string code) => $"message_code_{code}";
    public static string MessageLocalized(int messageId, int languageId) => $"message_{messageId}_lang_{languageId}";
    public static string MessagesByLanguage(int languageId) => $"messages_lang_{languageId}";
    
    public static string Language(int id) => $"language_{id}";
    public static string LanguageByCode(string code) => $"language_code_{code}";
    public static string LanguagesByPaginated(int page, int pageSize) => $"languages_page_{page}_size_{pageSize}";
}