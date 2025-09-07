using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Shopping.Db;
using Asala.Core.Modules.Shopping.DTOs;
using Asala.Core.Modules.Shopping.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Shopping;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICartRepository _cartRepository;
    private readonly ICartItemRepository _cartItemRepository;
    private readonly IProductRepository _productRepository;
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderItemRepository _orderItemRepository;

    public CartService(
        IUnitOfWork unitOfWork,
        ICartRepository cartRepository,
        ICartItemRepository cartItemRepository,
        IProductRepository productRepository,
        IOrderRepository orderRepository,
        IOrderItemRepository orderItemRepository)
    {
        _unitOfWork = unitOfWork;
        _cartRepository = cartRepository;
        _cartItemRepository = cartItemRepository;
        _productRepository = productRepository;
        _orderRepository = orderRepository;
        _orderItemRepository = orderItemRepository;
    }

    public async Task<Result<CartDto>> GetUserCartAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get user's cart with items
            var cartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
            if (!cartResult.IsSuccess)
                return Result.Failure<CartDto>(cartResult.MessageCode);

            if (cartResult.Value == null)
            {
                // Return empty cart if user doesn't have one yet
                return Result.Success(new CartDto
                {
                    Id = 0,
                    UserId = userId,
                    TotalAmount = 0,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CartItems = new List<CartItemDto>()
                });
            }

            // Map to DTO with detailed item information
            var cartDto = await MapToCartDtoWithDetailsAsync(cartResult.Value, cancellationToken);
            return Result.Success(cartDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<CartDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<CartDto>> AddProductToCartAsync(int userId, AddToCartDto addToCartDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // First, get the product to fetch its price
            var productResult = await _productRepository.GetByIdAsync(addToCartDto.ProductId, cancellationToken);
            if (!productResult.IsSuccess)
                return Result.Failure<CartDto>(productResult.MessageCode);
            
            if (productResult.Value == null)
                return Result.Failure<CartDto>(MessageCodes.PRODUCT_NOT_FOUND);

            var product = productResult.Value;
            var productPrice = product.Price;

            // Get or create user's cart
            var cartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
            if (!cartResult.IsSuccess)
                return Result.Failure<CartDto>(cartResult.MessageCode);

            Cart cart;
            if (cartResult.Value == null)
            {
                // Create new cart for user
                cart = new Cart
                {
                    UserId = userId,
                    TotalAmount = 0,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var addCartResult = await _cartRepository.AddAsync(cart, cancellationToken);
                if (!addCartResult.IsSuccess)
                    return Result.Failure<CartDto>(addCartResult.MessageCode);

                cart = addCartResult.Value;
            }
            else
            {
                cart = cartResult.Value;
            }

            // Check if product already exists in cart
            var existingItemResult = await _cartItemRepository.GetByCartAndProductAsync(
                cart.Id, addToCartDto.ProductId, addToCartDto.PostId, cancellationToken);
            
            if (!existingItemResult.IsSuccess)
                return Result.Failure<CartDto>(existingItemResult.MessageCode);

            if (existingItemResult.Value != null)
            {
                // Update existing cart item quantity
                var existingItem = existingItemResult.Value;
                existingItem.Quantity += addToCartDto.Quantity;
                existingItem.Price = productPrice; // Update price in case it changed
                existingItem.UpdatedAt = DateTime.UtcNow;

                var updateResult = _cartItemRepository.Update(existingItem);
                if (!updateResult.IsSuccess)
                    return Result.Failure<CartDto>(updateResult.MessageCode);
            }
            else
            {
                // Add new cart item
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = addToCartDto.ProductId,
                    PostId = addToCartDto.PostId,
                    Quantity = addToCartDto.Quantity,
                    Price = productPrice, // Set actual product price
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var addItemResult = await _cartItemRepository.AddAsync(cartItem, cancellationToken);
                if (!addItemResult.IsSuccess)
                    return Result.Failure<CartDto>(addItemResult.MessageCode);
            }

            // Calculate and update cart total
            await UpdateCartTotalAsync(cart.Id, cancellationToken);

            // Save changes
            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<CartDto>(saveResult.MessageCode);

            // Get updated cart with items
            var updatedCartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
            if (!updatedCartResult.IsSuccess)
                return Result.Failure<CartDto>(updatedCartResult.MessageCode);

            // Map to DTO
            var cartDto = MapToCartDto(updatedCartResult.Value!);
            return Result.Success(cartDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<CartDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<CartDto>> UpdateCartItemQuantityAsync(int userId, int cartItemId, int newQuantity, CancellationToken cancellationToken = default)
    {
        try
        {
            if (newQuantity <= 0)
            {
                return Result.Failure<CartDto>(MessageCodes.CART_ITEM_QUANTITY_INVALID);
            }

            // Get the cart item
            var cartItemResult = await _cartItemRepository.GetByIdAsync(cartItemId, cancellationToken);
            if (!cartItemResult.IsSuccess)
                return Result.Failure<CartDto>(cartItemResult.MessageCode);

            if (cartItemResult.Value == null)
                return Result.Failure<CartDto>(MessageCodes.CART_ITEM_NOT_FOUND);

            var cartItem = cartItemResult.Value;

            // Verify the cart item belongs to the user's cart
            var cartResult = await _cartRepository.GetByIdAsync(cartItem.CartId, cancellationToken);
            if (!cartResult.IsSuccess)
                return Result.Failure<CartDto>(cartResult.MessageCode);

            if (cartResult.Value == null || cartResult.Value.UserId != userId)
                return Result.Failure<CartDto>(MessageCodes.CART_NOT_FOUND);

            // Update the quantity
            cartItem.Quantity = newQuantity;
            cartItem.UpdatedAt = DateTime.UtcNow;

            var updateResult = _cartItemRepository.Update(cartItem);
            if (!updateResult.IsSuccess)
                return Result.Failure<CartDto>(updateResult.MessageCode);

            // Update cart total
            await UpdateCartTotalAsync(cartItem.CartId, cancellationToken);

            // Save changes
            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<CartDto>(saveResult.MessageCode);

            // Get updated cart with items
            var updatedCartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
            if (!updatedCartResult.IsSuccess)
                return Result.Failure<CartDto>(updatedCartResult.MessageCode);

            var cartDto = MapToCartDto(updatedCartResult.Value!);
            return Result.Success(cartDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<CartDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<CartDto>> RemoveFromCartAsync(int userId, int cartItemId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get the cart item
            var cartItemResult = await _cartItemRepository.GetByIdAsync(cartItemId, cancellationToken);
            if (!cartItemResult.IsSuccess)
                return Result.Failure<CartDto>(cartItemResult.MessageCode);

            if (cartItemResult.Value == null)
                return Result.Failure<CartDto>(MessageCodes.CART_ITEM_NOT_FOUND);

            var cartItem = cartItemResult.Value;

            // Verify the cart item belongs to the user's cart
            var cartResult = await _cartRepository.GetByIdAsync(cartItem.CartId, cancellationToken);
            if (!cartResult.IsSuccess)
                return Result.Failure<CartDto>(cartResult.MessageCode);

            if (cartResult.Value == null || cartResult.Value.UserId != userId)
                return Result.Failure<CartDto>(MessageCodes.CART_NOT_FOUND);

            // Remove the cart item (soft delete)
            cartItem.IsDeleted = true;
            cartItem.DeletedAt = DateTime.UtcNow;
            cartItem.UpdatedAt = DateTime.UtcNow;

            var updateResult = _cartItemRepository.Update(cartItem);
            if (!updateResult.IsSuccess)
                return Result.Failure<CartDto>(updateResult.MessageCode);

            // Update cart total
            await UpdateCartTotalAsync(cartItem.CartId, cancellationToken);

            // Save changes
            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<CartDto>(saveResult.MessageCode);

            // Get updated cart with items
            var updatedCartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
            if (!updatedCartResult.IsSuccess)
                return Result.Failure<CartDto>(updatedCartResult.MessageCode);

            var cartDto = MapToCartDto(updatedCartResult.Value!);
            return Result.Success(cartDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<CartDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<CartDto>> ClearCartAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get user's cart
            var cartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
            if (!cartResult.IsSuccess)
                return Result.Failure<CartDto>(cartResult.MessageCode);

            if (cartResult.Value == null)
            {
                // Return empty cart if user doesn't have one
                return Result.Success(new CartDto
                {
                    Id = 0,
                    UserId = userId,
                    TotalAmount = 0,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    CartItems = new List<CartItemDto>()
                });
            }

            var cart = cartResult.Value;

            // Get all cart items for this cart
            var cartItemsResult = await _cartItemRepository.GetByCartIdAsync(cart.Id, cancellationToken);
            if (cartItemsResult.IsSuccess && cartItemsResult.Value != null)
            {
                // Soft delete all cart items
                foreach (var cartItem in cartItemsResult.Value.Where(item => !item.IsDeleted))
                {
                    cartItem.IsDeleted = true;
                    cartItem.DeletedAt = DateTime.UtcNow;
                    cartItem.UpdatedAt = DateTime.UtcNow;
                    _cartItemRepository.Update(cartItem);
                }
            }

            // Reset cart total to 0
            cart.TotalAmount = 0;
            cart.UpdatedAt = DateTime.UtcNow;
            _cartRepository.Update(cart);

            // Save changes
            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (!saveResult.IsSuccess)
                return Result.Failure<CartDto>(saveResult.MessageCode);

            // Return empty cart
            var clearedCartDto = new CartDto
            {
                Id = cart.Id,
                UserId = cart.UserId,
                TotalAmount = 0,
                IsActive = cart.IsActive,
                CreatedAt = cart.CreatedAt,
                UpdatedAt = cart.UpdatedAt,
                CartItems = new List<CartItemDto>()
            };

            return Result.Success(clearedCartDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<CartDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<CheckoutResultDto>> CheckoutAsync(int userId, CheckoutDto checkoutDto, CancellationToken cancellationToken = default)
    {
        try
        {
            // Begin transaction for checkout process
            var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
            if (!transactionResult.IsSuccess)
                return Result.Failure<CheckoutResultDto>(transactionResult.MessageCode);

            try
            {
                // Get user's cart with items
                var cartResult = await _cartRepository.GetByUserIdWithItemsAsync(userId, cancellationToken);
                if (!cartResult.IsSuccess)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<CheckoutResultDto>(cartResult.MessageCode);
                }

                if (cartResult.Value == null || !cartResult.Value.CartItems.Any(i => !i.IsDeleted && i.IsActive))
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<CheckoutResultDto>(MessageCodes.CART_EMPTY);
                }

                var cart = cartResult.Value;
                var activeCartItems = cart.CartItems.Where(i => !i.IsDeleted && i.IsActive).ToList();

                // Step 1: Validate stock availability for all items
                var stockValidationResult = await ValidateStockAvailabilityAsync(activeCartItems, cancellationToken);
                if (!stockValidationResult.IsSuccess)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Success(new CheckoutResultDto
                    {
                        IsSuccess = false,
                        StockErrors = stockValidationResult.Value
                    });
                }

                // Step 2: Create order
                var order = new Order
                {
                    UserId = userId,
                    TotalAmount = cart.TotalAmount,
                    ShippingAddressId = checkoutDto.ShippingAddressId,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                var orderResult = await _orderRepository.AddAsync(order, cancellationToken);
                if (!orderResult.IsSuccess)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<CheckoutResultDto>(orderResult.MessageCode);
                }

                var createdOrder = orderResult.Value;

                // Step 3: Create order items and update product quantities
                var orderItems = new List<OrderItem>();
                foreach (var cartItem in activeCartItems)
                {
                    // Get product to find provider
                    var productResult = await _productRepository.GetByIdAsync(cartItem.ProductId, cancellationToken);
                    if (!productResult.IsSuccess || productResult.Value == null)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                        return Result.Failure<CheckoutResultDto>(MessageCodes.PRODUCT_NOT_FOUND);
                    }

                    var product = productResult.Value;

                    // Create order item
                    var orderItem = new OrderItem
                    {
                        OrderId = createdOrder.Id,
                        ProductId = cartItem.ProductId,
                        PostId = cartItem.PostId,
                        Quantity = cartItem.Quantity,
                        Price = cartItem.Price,
                        ProviderId = product.ProviderId,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    var orderItemResult = await _orderItemRepository.AddAsync(orderItem, cancellationToken);
                    if (!orderItemResult.IsSuccess)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                        return Result.Failure<CheckoutResultDto>(orderItemResult.MessageCode);
                    }

                    orderItems.Add(orderItemResult.Value);

                    // Update product quantity
                    product.Quantity -= cartItem.Quantity;
                    product.UpdatedAt = DateTime.UtcNow;
                    var updateProductResult = _productRepository.Update(product);
                    if (!updateProductResult.IsSuccess)
                    {
                        await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                        return Result.Failure<CheckoutResultDto>(updateProductResult.MessageCode);
                    }
                }

                // Step 4: Clear cart (soft delete all items)
                foreach (var cartItem in activeCartItems)
                {
                    cartItem.IsDeleted = true;
                    cartItem.DeletedAt = DateTime.UtcNow;
                    cartItem.UpdatedAt = DateTime.UtcNow;
                    _cartItemRepository.Update(cartItem);
                }

                // Reset cart total
                cart.TotalAmount = 0;
                cart.UpdatedAt = DateTime.UtcNow;
                _cartRepository.Update(cart);

                // Step 5: Save all changes
                var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
                if (!saveResult.IsSuccess)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<CheckoutResultDto>(saveResult.MessageCode);
                }

                // Commit transaction
                var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
                if (!commitResult.IsSuccess)
                {
                    await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                    return Result.Failure<CheckoutResultDto>(commitResult.MessageCode);
                }

                // Step 6: Return success result with order details
                var orderDto = await MapToOrderDtoAsync(createdOrder, orderItems, cancellationToken);
                return Result.Success(new CheckoutResultDto
                {
                    IsSuccess = true,
                    Order = orderDto,
                    StockErrors = new List<StockValidationError>()
                });
            }
            catch (Exception)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                throw;
            }
        }
        catch (Exception ex)
        {
            return Result.Failure<CheckoutResultDto>(MessageCodes.CHECKOUT_FAILED, ex);
        }
    }

    private async Task<Result<List<StockValidationError>>> ValidateStockAvailabilityAsync(
        List<CartItem> cartItems, 
        CancellationToken cancellationToken)
    {
        var stockErrors = new List<StockValidationError>();

        foreach (var cartItem in cartItems)
        {
            var productResult = await _productRepository.GetByIdAsync(cartItem.ProductId, cancellationToken);
            if (!productResult.IsSuccess || productResult.Value == null)
            {
                stockErrors.Add(new StockValidationError
                {
                    ProductId = cartItem.ProductId,
                    ProductName = "Unknown Product",
                    RequestedQuantity = cartItem.Quantity,
                    AvailableQuantity = 0,
                    Message = "Product not found"
                });
                continue;
            }

            var product = productResult.Value;
            if (product.Quantity < cartItem.Quantity)
            {
                stockErrors.Add(new StockValidationError
                {
                    ProductId = cartItem.ProductId,
                    ProductName = product.Name,
                    RequestedQuantity = cartItem.Quantity,
                    AvailableQuantity = product.Quantity,
                    Message = $"Insufficient stock. Requested: {cartItem.Quantity}, Available: {product.Quantity}"
                });
            }
        }

        if (stockErrors.Any())
        {
            return Result.Success(stockErrors);
        }

        return Result.Success(new List<StockValidationError>());
    }

    private async Task<OrderDto> MapToOrderDtoAsync(Order order, List<OrderItem> orderItems, CancellationToken cancellationToken)
    {
        var orderItemDtos = new List<OrderItemDto>();

        foreach (var item in orderItems)
        {
            var productResult = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
            var productName = productResult.IsSuccess && productResult.Value != null 
                ? productResult.Value.Name 
                : "Unknown Product";

            orderItemDtos.Add(new OrderItemDto
            {
                Id = item.Id,
                OrderId = item.OrderId,
                ProductId = item.ProductId,
                PostId = item.PostId,
                Quantity = item.Quantity,
                Price = item.Price,
                ProviderId = item.ProviderId,
                ProductName = productName,
                IsActive = item.IsActive,
                CreatedAt = item.CreatedAt,
                Activities = new List<OrderItemActivityDto>()
            });
        }

        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            ShippingAddressId = order.ShippingAddressId,
            CurrentStatus = "Pending", // Default status
            IsActive = order.IsActive,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            OrderItems = orderItemDtos,
            OrderActivities = new List<OrderActivityDto>()
        };
    }

    private async Task UpdateCartTotalAsync(int cartId, CancellationToken cancellationToken)
    {
        // Get all active cart items for this cart
        var cartItemsResult = await _cartItemRepository.GetByCartIdAsync(cartId, cancellationToken);
        if (cartItemsResult.IsSuccess && cartItemsResult.Value != null)
        {
            // Calculate total from all active cart items
            var total = cartItemsResult.Value
                .Where(item => item.IsActive && !item.IsDeleted)
                .Sum(item => item.Price * item.Quantity);

            // Get the cart and update its total
            var cartResult = await _cartRepository.GetByIdAsync(cartId, cancellationToken);
            if (cartResult.IsSuccess && cartResult.Value != null)
            {
                var cart = cartResult.Value;
                cart.TotalAmount = total;
                cart.UpdatedAt = DateTime.UtcNow;
                _cartRepository.Update(cart);
            }
        }
    }

    private async Task<CartDto> MapToCartDtoWithDetailsAsync(Cart cart, CancellationToken cancellationToken)
    {
        var cartItemDtos = new List<CartItemDto>();

        foreach (var item in cart.CartItems.Where(i => !i.IsDeleted && i.IsActive))
        {
            // Get product details
            var productResult = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
            var productName = productResult.IsSuccess && productResult.Value != null 
                ? productResult.Value.Name 
                : "Unknown Product";

            // You can also get product image URL if needed
            var productImageUrl = productResult.IsSuccess && productResult.Value != null 
                ? productResult.Value.ProductMedias?.FirstOrDefault(m => m.MediaType == MediaTypeEnum.Image)?.Url
                : null;

            cartItemDtos.Add(new CartItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                PostId = item.PostId,
                Quantity = item.Quantity,
                Price = item.Price,
                CartId = item.CartId,
                ProductName = productName,
                ProductImageUrl = productImageUrl,
                IsActive = item.IsActive,
                CreatedAt = item.CreatedAt
            });
        }

        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            TotalAmount = cart.TotalAmount,
            IsActive = cart.IsActive,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            CartItems = cartItemDtos
        };
    }

    private CartDto MapToCartDto(Cart cart)
    {
        return new CartDto
        {
            Id = cart.Id,
            UserId = cart.UserId,
            TotalAmount = cart.TotalAmount,
            IsActive = cart.IsActive,
            CreatedAt = cart.CreatedAt,
            UpdatedAt = cart.UpdatedAt,
            CartItems = cart.CartItems.Where(i => !i.IsDeleted && i.IsActive).Select(item => new CartItemDto
            {
                Id = item.Id,
                ProductId = item.ProductId,
                PostId = item.PostId,
                Quantity = item.Quantity,
                Price = item.Price,
                CartId = item.CartId,
                ProductName = string.Empty, // Basic mapping without details
                ProductImageUrl = null,
                IsActive = item.IsActive,
                CreatedAt = item.CreatedAt
            }).ToList()
        };
    }
}