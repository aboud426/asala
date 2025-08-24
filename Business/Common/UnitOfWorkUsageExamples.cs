using System;
using System.Linq;
using System.Threading.Tasks;
using Business.Common;
using Business.Interfaces;
using Infrastructure.Models;

namespace Business.Common;

/// <summary>
/// Examples demonstrating how to use the Unit of Work pattern
/// </summary>
public class UnitOfWorkUsageExamples
{
    private readonly IUnitOfWork _unitOfWork;

    public UnitOfWorkUsageExamples(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    /// <summary>
    /// Example: Simple repository operation
    /// </summary>
    public async Task<Result<User?>> GetUserExample(int userId)
    {
        return await _unitOfWork.Users.GetByIdAsync(userId);
    }

    /// <summary>
    /// Example: Getting paginated results
    /// </summary>
    public async Task<Result<PaginatedResult<Product>>> GetProductsExample(int page, int pageSize)
    {
        return await _unitOfWork.Products.GetPaginatedAsync(
            page,
            pageSize,
            filter: p => p.Quantity > 0,
            orderBy: query => query.OrderBy(p => p.Name),
            includeProperties: "Category,Provider"
        );
    }

    /// <summary>
    /// Example: Single operation with automatic save
    /// </summary>
    public async Task<Result<Product>> CreateProductExample(string name, int categoryId, int providerId, decimal price)
    {
        var product = new Product
        {
            Name = name,
            CategoryId = categoryId,
            ProviderId = providerId,
            Price = price,
            Quantity = 0
        };

        var addResult = await _unitOfWork.Products.AddAsync(product);
        if (addResult.IsFailure)
            return Result.Failure<Product>(addResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync();
        if (saveResult.IsFailure)
            return Result.Failure<Product>(saveResult.Error);

        return Result<Product>.Success(addResult.Value);
    }

    /// <summary>
    /// Example: Multiple operations with transaction
    /// </summary>
    public async Task<Result<Order>> CreateOrderWithItemsExample(int userId, int shippingAddressId, 
        (int ProductId, int Quantity, decimal Price)[] orderItems)
    {
        // Begin transaction
        var beginResult = await _unitOfWork.BeginTransactionAsync();
        if (beginResult.IsFailure)
            return Result.Failure<Order>(beginResult.Error);

        try
        {
            // Create order
            var order = new Order
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                ShippingAddressId = shippingAddressId,
                TotalAmount = 0
            };

            var addOrderResult = await _unitOfWork.Orders.AddAsync(order);
            if (addOrderResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure<Order>(addOrderResult.Error);
            }

            // Save to get the order ID
            var saveOrderResult = await _unitOfWork.SaveChangesAsync();
            if (saveOrderResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure<Order>(saveOrderResult.Error);
            }

            decimal totalAmount = 0;

            // Create order items
            foreach (var (productId, quantity, price) in orderItems)
            {
                // Check product availability
                var productResult = await _unitOfWork.Products.GetByIdAsync(productId);
                if (productResult.IsFailure || productResult.Value == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return Result.Failure<Order>($"Product {productId} not found");
                }

                if (productResult.Value.Quantity < quantity)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return Result.Failure<Order>($"Insufficient quantity for product {productId}");
                }

                // Create order item
                var orderItem = new OrderItem
                {
                    OrderId = addOrderResult.Value.Id,
                    ProductId = productId,
                    Quantity = quantity,
                    UnitPrice = price,
                    TotalPrice = price * quantity
                };

                var addItemResult = await _unitOfWork.Repository<OrderItem>().AddAsync(orderItem);
                if (addItemResult.IsFailure)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return Result.Failure<Order>(addItemResult.Error);
                }

                // Update product quantity
                productResult.Value.Quantity -= quantity;
                var updateProductResult = _unitOfWork.Products.Update(productResult.Value);
                if (updateProductResult.IsFailure)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return Result.Failure<Order>(updateProductResult.Error);
                }

                totalAmount += orderItem.TotalPrice;
            }

            // Update order total
            addOrderResult.Value.TotalAmount = totalAmount;
            var updateOrderResult = _unitOfWork.Orders.Update(addOrderResult.Value);
            if (updateOrderResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure<Order>(updateOrderResult.Error);
            }

            // Save all changes
            var saveResult = await _unitOfWork.SaveChangesAsync();
            if (saveResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure<Order>(saveResult.Error);
            }

            // Commit transaction
            var commitResult = await _unitOfWork.CommitTransactionAsync();
            if (commitResult.IsFailure)
                return Result.Failure<Order>(commitResult.Error);

            return Result<Order>.Success(addOrderResult.Value);
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Result.Failure<Order>($"Error creating order: {ex.Message}");
        }
    }

    /// <summary>
    /// Example: Complex query with multiple conditions
    /// </summary>
    public async Task<Result<PaginatedResult<Product>>> SearchProductsExample(
        string? searchTerm, 
        int? categoryId, 
        decimal? minPrice, 
        decimal? maxPrice,
        int page, 
        int pageSize)
    {
        return await _unitOfWork.Products.GetPaginatedAsync(
            page,
            pageSize,
            filter: p => 
                (string.IsNullOrEmpty(searchTerm) || p.Name.Contains(searchTerm)) &&
                (!categoryId.HasValue || p.CategoryId == categoryId.Value) &&
                (!minPrice.HasValue || p.Price >= minPrice.Value) &&
                (!maxPrice.HasValue || p.Price <= maxPrice.Value) &&
                p.Quantity > 0,
            orderBy: query => query.OrderBy(p => p.Name),
            includeProperties: "Category,Provider"
        );
    }

    /// <summary>
    /// Example: Using generic repository for any entity
    /// </summary>
    public async Task<Result<TEntity?>> GetEntityByIdExample<TEntity>(int id) where TEntity : class
    {
        return await _unitOfWork.Repository<TEntity>().GetByIdAsync(id);
    }

    /// <summary>
    /// Example: Bulk operations
    /// </summary>
    public async Task<Result> BulkUpdateProductPricesExample(int categoryId, decimal percentageIncrease)
    {
        var beginResult = await _unitOfWork.BeginTransactionAsync();
        if (beginResult.IsFailure)
            return Result.Failure(beginResult.Error);

        try
        {
            // Get all products in category
            var productsResult = await _unitOfWork.Products.GetAsync(
                filter: p => p.CategoryId == categoryId,
                includeProperties: "Category"
            );

            if (productsResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure(productsResult.Error);
            }

            // Update prices
            var products = productsResult.Value.ToList();
            foreach (var product in products)
            {
                product.Price = Math.Round(product.Price * (1 + percentageIncrease / 100), 2);
            }

            var updateResult = _unitOfWork.Products.UpdateRange(products);
            if (updateResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure(updateResult.Error);
            }

            var saveResult = await _unitOfWork.SaveChangesAsync();
            if (saveResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return Result.Failure(saveResult.Error);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync();
            return commitResult.IsFailure ? Result.Failure(commitResult.Error) : Result.Success();
        }
        catch (Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync();
            return Result.Failure($"Error updating prices: {ex.Message}");
        }
    }
}