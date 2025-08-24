namespace Business.Common;

/// <summary>
/// Centralized cache key definitions to avoid magic strings
/// </summary>
public static class CacheKeys
{
    public const string ALL_PRODUCTS = "all_products";
    public const string ALL_CATEGORIES = "all_categories";
    public const string ALL_USERS = "all_users";
    
    public static string Product(int id) => $"product_{id}";
    public static string ProductsByCategory(int categoryId) => $"products_category_{categoryId}";
    public static string ProductsByProvider(int providerId) => $"products_provider_{providerId}";
    public static string User(int id) => $"user_{id}";
    public static string Category(int id) => $"category_{id}";
    public static string ProductsPaginated(int page, int pageSize, string? filter = null) 
        => $"products_page_{page}_size_{pageSize}" + (string.IsNullOrEmpty(filter) ? "" : $"_filter_{filter}");
}