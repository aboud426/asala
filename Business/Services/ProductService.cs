using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Infrastructure.Common;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Business.Common;

namespace Business.Services;

/// <summary>
/// Product service with transparent caching implementation
/// </summary>
public interface IProductService
{
    Task<Result<Product?>> GetProductByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Product>>> GetProductsAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Product>>> GetProductsByCategoryAsync(int categoryId, int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<Product>> CreateProductAsync(string name, int categoryId, int providerId, decimal price, int quantity = 0, string? description = null, CancellationToken cancellationToken = default);
    Task<Result> UpdateProductAsync(Product product, CancellationToken cancellationToken = default);
    Task<Result> DeleteProductAsync(int id, CancellationToken cancellationToken = default);
    Task<Result> UpdateProductQuantityAsync(int productId, int newQuantity, CancellationToken cancellationToken = default);
    Task<Result<bool>> IsProductAvailableAsync(int productId, int requestedQuantity, CancellationToken cancellationToken = default);
}

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;

    public ProductService(IUnitOfWork unitOfWork, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public async Task<Result<Product?>> GetProductByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<Product?>("Invalid product ID");

        // Cache-aside pattern: Check cache first
        return await _cache.GetOrSetAsync(
            CacheKeys.Product(id),
            async () => await _unitOfWork.Products.GetByIdAsync(id, cancellationToken),
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<PaginatedResult<Product>>> GetProductsAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        var cacheKey = CacheKeys.ProductsPaginated(page, pageSize);
        
        return await _cache.GetOrSetAsync(
            cacheKey,
            async () => await _unitOfWork.Products.GetPaginatedAsync(
                page,
                pageSize,
                filter: p => p.Quantity >= 0,
                orderBy: query => query.OrderBy(p => p.Name),
                includeProperties: "Category,Provider",
                cancellationToken: cancellationToken),
            CacheHelper.ExpirationTimes.Short // Shorter expiration for paginated lists
        );
    }

    public async Task<Result<PaginatedResult<Product>>> GetProductsByCategoryAsync(int categoryId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        if (categoryId <= 0)
            return Result.Failure<PaginatedResult<Product>>("Invalid category ID");

        var cacheKey = CacheKeys.ProductsByCategory(categoryId);
        
        return await _cache.GetOrSetAsync(
            cacheKey,
            async () => await _unitOfWork.Products.GetPaginatedAsync(
                page,
                pageSize,
                filter: p => p.CategoryId == categoryId && p.Quantity >= 0,
                orderBy: query => query.OrderBy(p => p.Name),
                includeProperties: "Category,Provider",
                cancellationToken: cancellationToken),
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<Product>> CreateProductAsync(string name, int categoryId, int providerId, decimal price, int quantity = 0, string? description = null, CancellationToken cancellationToken = default)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(name))
            return Result.Failure<Product>("Product name is required");

        if (categoryId <= 0)
            return Result.Failure<Product>("Invalid category ID");

        if (providerId <= 0)
            return Result.Failure<Product>("Invalid provider ID");

        if (price < 0)
            return Result.Failure<Product>("Price cannot be negative");

        if (quantity < 0)
            return Result.Failure<Product>("Quantity cannot be negative");

        // Validate category exists
        var categoryExistsResult = await _unitOfWork.Categories.AnyAsync(c => c.Id == categoryId, cancellationToken);
        if (categoryExistsResult.IsFailure)
            return Result.Failure<Product>(categoryExistsResult.Error);

        if (!categoryExistsResult.Value)
            return Result.Failure<Product>("Category not found");

        // Validate provider exists
        var providerExistsResult = await _unitOfWork.Providers.AnyAsync(p => p.UserId == providerId, cancellationToken);
        if (providerExistsResult.IsFailure)
            return Result.Failure<Product>(providerExistsResult.Error);

        if (!providerExistsResult.Value)
            return Result.Failure<Product>("Provider not found");

        // Create product
        var product = new Product
        {
            Name = name.Trim(),
            CategoryId = categoryId,
            ProviderId = providerId,
            Price = price,
            Quantity = quantity,
            Description = description?.Trim()
        };

        var addResult = await _unitOfWork.Products.AddAsync(product, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<Product>(addResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<Product>(saveResult.Error);

        // Cache invalidation: Clear related cache entries
        InvalidateProductCaches(categoryId, providerId);

        return Result<Product>.Success(addResult.Value!);
    }

    public async Task<Result> UpdateProductAsync(Product product, CancellationToken cancellationToken = default)
    {
        if (product == null)
            return Result.Failure("Product cannot be null");

        if (string.IsNullOrWhiteSpace(product.Name))
            return Result.Failure("Product name is required");

        // Get existing product to compare changes
        var existingProductResult = await _unitOfWork.Products.GetByIdAsync(product.Id, cancellationToken);
        if (existingProductResult.IsFailure)
            return Result.Failure(existingProductResult.Error);

        if (existingProductResult.Value == null)
            return Result.Failure("Product not found");

        var existingProduct = existingProductResult.Value;

        var updateResult = _unitOfWork.Products.Update(product);
        if (updateResult.IsFailure)
            return Result.Failure(updateResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure(saveResult.Error);

        // Cache invalidation: Remove specific product and related caches
        InvalidateProductCaches(product.Id, product.CategoryId, product.ProviderId);
        
        // If category changed, also invalidate old category cache
        if (existingProduct.CategoryId != product.CategoryId)
        {
            _cache.Remove(CacheKeys.ProductsByCategory(existingProduct.CategoryId));
        }

        return Result.Success();
    }

    public async Task<Result> DeleteProductAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure("Invalid product ID");

        // Get product first to know which caches to invalidate
        var productResult = await _unitOfWork.Products.GetByIdAsync(id, cancellationToken);
        if (productResult.IsFailure)
            return Result.Failure(productResult.Error);

        if (productResult.Value == null)
            return Result.Failure("Product not found");

        var product = productResult.Value;

        var removeResult = await _unitOfWork.Products.RemoveByIdAsync(id, cancellationToken);
        if (removeResult.IsFailure)
            return Result.Failure(removeResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure(saveResult.Error);

        // Cache invalidation
        InvalidateProductCaches(id, product.CategoryId, product.ProviderId);

        return Result.Success();
    }

    public async Task<Result> UpdateProductQuantityAsync(int productId, int newQuantity, CancellationToken cancellationToken = default)
    {
        if (productId <= 0)
            return Result.Failure("Invalid product ID");

        if (newQuantity < 0)
            return Result.Failure("Quantity cannot be negative");

        var productResult = await _unitOfWork.Products.GetByIdAsync(productId, cancellationToken);
        if (productResult.IsFailure)
            return Result.Failure(productResult.Error);

        if (productResult.Value == null)
            return Result.Failure("Product not found");

        var product = productResult.Value;
        product.Quantity = newQuantity;

        var updateResult = _unitOfWork.Products.Update(product);
        if (updateResult.IsFailure)
            return Result.Failure(updateResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure(saveResult.Error);

        // Cache invalidation for quantity updates (lightweight)
        _cache.Remove(CacheKeys.Product(productId));
        
        return Result.Success();
    }

    public async Task<Result<bool>> IsProductAvailableAsync(int productId, int requestedQuantity, CancellationToken cancellationToken = default)
    {
        if (productId <= 0)
            return Result.Failure<bool>("Invalid product ID");

        if (requestedQuantity <= 0)
            return Result.Failure<bool>("Requested quantity must be greater than 0");

        var productResult = await GetProductByIdAsync(productId, cancellationToken);
        if (productResult.IsFailure)
            return Result.Failure<bool>(productResult.Error);

        if (productResult.Value == null)
            return Result.Failure<bool>("Product not found");

        var isAvailable = productResult.Value.Quantity >= requestedQuantity;
        return Result<bool>.Success(isAvailable);
    }

    /// <summary>
    /// Invalidates product-related cache entries
    /// </summary>
    private void InvalidateProductCaches(int productId, int? categoryId = null, int? providerId = null)
    {
        // Remove specific product
        _cache.Remove(CacheKeys.Product(productId));

        // Remove category-specific caches
        if (categoryId.HasValue)
        {
            _cache.Remove(CacheKeys.ProductsByCategory(categoryId.Value));
        }

        // Remove provider-specific caches
        if (providerId.HasValue)
        {
            _cache.Remove(CacheKeys.ProductsByProvider(providerId.Value));
        }

        // Remove paginated product lists (they need to be refreshed)
        _cache.RemoveByPattern("products_page_");
        
        // Remove general products cache
        _cache.Remove(CacheKeys.ALL_PRODUCTS);
    }

    /// <summary>
    /// Overload for create/update operations
    /// </summary>
    private void InvalidateProductCaches(int? categoryId, int? providerId)
    {
        if (categoryId.HasValue)
        {
            _cache.Remove(CacheKeys.ProductsByCategory(categoryId.Value));
        }

        if (providerId.HasValue)
        {
            _cache.Remove(CacheKeys.ProductsByProvider(providerId.Value));
        }

        _cache.RemoveByPattern("products_page_");
        _cache.Remove(CacheKeys.ALL_PRODUCTS);
    }
}