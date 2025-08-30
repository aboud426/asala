using Microsoft.Extensions.Caching.Memory;
using Infrastructure.Common;

namespace Business.Common;

/// <summary>
/// Demonstrates how the caching system works in TourTrade application
/// </summary>
public class CachingDemonstration
{
    /// <summary>
    /// Example showing how transparent caching works
    /// 
    /// Key Benefits:
    /// 1. Cache-Aside Pattern: Check cache first, then database
    /// 2. Automatic Cache Invalidation: When data changes, cache is cleared
    /// 3. Configurable Expiration: Different expiration times for different data types
    /// 4. Transparent to Controllers: Controllers use services normally
    /// 
    /// Cache Flow for Product Operations:
    /// 
    /// GET /api/product/123
    /// 1. ProductController.GetProduct(123) calls ProductService.GetProductByIdAsync(123)
    /// 2. ProductService checks cache with key "product_123"
    /// 3. If cached → return cached result (fast!)
    /// 4. If not cached → query database, store in cache, return result
    /// 
    /// PUT /api/product/123
    /// 1. ProductController.UpdateProduct(123) calls ProductService.UpdateProductAsync(product)
    /// 2. ProductService updates database
    /// 3. ProductService invalidates caches:
    ///    - Remove "product_123" (specific product)
    ///    - Remove "products_category_X" (category lists)
    ///    - Remove "products_page_*" (paginated lists)
    ///    - Remove "all_products" (all products cache)
    /// 4. Next GET request will fetch fresh data from database
    /// 
    /// Cache Keys Structure:
    /// - Single entities: "product_123", "user_456", "category_789"
    /// - Collections: "products_category_5", "products_provider_10"
    /// - Paginated: "products_page_1_size_10", "products_page_2_size_20"
    /// - General: "all_products", "all_categories", "all_users"
    /// 
    /// Cache Expiration Times:
    /// - Short (5 min): Paginated lists, frequently changing data
    /// - Medium (15 min): Individual entities, category-filtered data
    /// - Long (1 hour): Static reference data
    /// - Very Long (24 hours): Configuration data
    /// </summary>
    public static void ExampleUsage()
    {
        // This is how the caching works internally in services:
        
        // 1. First request - cache miss, queries database
        // var product1 = await productService.GetProductByIdAsync(123); // Database hit
        
        // 2. Second request - cache hit, returns cached data  
        // var product2 = await productService.GetProductByIdAsync(123); // Cache hit (fast!)
        
        // 3. Update product - invalidates cache
        // await productService.UpdateProductAsync(modifiedProduct); // Cache cleared
        
        // 4. Next request - cache miss again, queries database with fresh data
        // var product3 = await productService.GetProductByIdAsync(123); // Database hit
    }

    /// <summary>
    /// Cache invalidation strategies used in the application
    /// </summary>
    public static class InvalidationStrategies
    {
        /// <summary>
        /// Product Operations:
        /// - CREATE: Clear category lists, paginated lists, all_products
        /// - UPDATE: Clear specific product, category lists, paginated lists
        /// - DELETE: Clear specific product, category lists, paginated lists
        /// - QUANTITY UPDATE: Clear only specific product (lightweight)
        /// </summary>
        public const string ProductStrategy = "Granular invalidation with category and list clearing";

        /// <summary>
        /// User Operations:
        /// - CREATE: Clear all_users
        /// - UPDATE: Clear specific user, all_users
        /// - DELETE: Clear specific user, all_users
        /// </summary>
        public const string UserStrategy = "Simple invalidation with specific and general clearing";
        
        /// <summary>
        /// Pattern-based invalidation:
        /// - "products_page_*" removes all paginated product lists
        /// - "user_*" removes all individual user caches
        /// </summary>
        public const string PatternStrategy = "Pattern-based clearing for related data";
    }

    /// <summary>
    /// Performance benefits of the caching implementation
    /// </summary>
    public static class PerformanceBenefits
    {
        /// <summary>
        /// Typical performance improvements:
        /// - Database queries: ~50-200ms
        /// - Cache hits: ~1-5ms
        /// - Performance gain: 10x-200x faster
        /// 
        /// Best cache hit scenarios:
        /// - Product catalog browsing
        /// - User profile viewing
        /// - Category listings
        /// - Search result pagination
        /// 
        /// Cache miss scenarios (expected):
        /// - First request after server restart
        /// - First request after cache expiration
        /// - First request after data modification
        /// </summary>
        public const string Summary = "10x-200x performance improvement for cached operations";
    }
}