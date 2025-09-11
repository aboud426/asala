using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Db;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Shopping.Db;
using Asala.Core.Modules.Shopping.DTOs;
using Asala.Core.Modules.Shopping.Models;
using Asala.Core.Modules.Users.Db;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Shopping;

public class OrderService : IOrderService
{
    private const int MaxPageSize = 100;
    private const int MinPageSize = 1;
    private const int MinPage = 1;
    private const int MinUserId = 1;
    private const int MinAddressId = 1;
    private const int MinProductId = 1;
    private const int MinQuantity = 0;

    private readonly IOrderRepository _orderRepository;
    private readonly IOrderItemRepository _orderItemRepository;
    private readonly IUserRepository _userRepository;
    private readonly IProductRepository _productRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IProviderRepository _providerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(
        IOrderRepository orderRepository,
        IOrderItemRepository orderItemRepository,
        IUserRepository userRepository,
        IProductRepository productRepository,
        ILocationRepository locationRepository,
        IProviderRepository providerRepository,
        IUnitOfWork unitOfWork
    )
    {
        _orderRepository =
            orderRepository ?? throw new ArgumentNullException(nameof(orderRepository));
        _orderItemRepository =
            orderItemRepository ?? throw new ArgumentNullException(nameof(orderItemRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _productRepository =
            productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        _locationRepository =
            locationRepository ?? throw new ArgumentNullException(nameof(locationRepository));
        _providerRepository =
            providerRepository ?? throw new ArgumentNullException(nameof(providerRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<OrderDto?>> CreateOrderAsync(
        CreateOrderDto createOrderDto,
        CancellationToken cancellationToken = default
    )
    {
        // Input validation
        var inputValidationResult = ValidateCreateOrderInput(createOrderDto);
        if (inputValidationResult.IsFailure)
            return Result.Failure<OrderDto?>(inputValidationResult.MessageCode);

        // Business logic validation
        var validationResult = await ValidateCreateOrderDto(createOrderDto, cancellationToken);
        if (validationResult.IsFailure)
            return Result.Failure<OrderDto?>(validationResult.MessageCode);

        return await ExecuteWithTransactionAsync(
            async () =>
            {
                var orderCreationData = await PrepareOrderCreationDataAsync(
                    createOrderDto,
                    cancellationToken
                );
                if (orderCreationData.IsFailure)
                    return Result.Failure<OrderDto?>(orderCreationData.MessageCode);

                var createdOrder = await CreateOrderWithItemsAsync(
                    createOrderDto,
                    orderCreationData.Value!,
                    cancellationToken
                );
                if (createdOrder.IsFailure)
                    return Result.Failure<OrderDto?>(createdOrder.MessageCode);

                var orderWithItemsResult = await _orderRepository.GetByIdWithItemsAsync(
                    createdOrder.Value!.Id,
                    cancellationToken
                );

                if (orderWithItemsResult.IsFailure || orderWithItemsResult.Value == null)
                    return Result.Failure<OrderDto?>(MessageCodes.DB_ERROR);

                var dto = MapToDto(orderWithItemsResult.Value);
                return Result.Success<OrderDto?>(dto);
            },
            cancellationToken
        );
    }

    public async Task<Result<OrderDto?>> GetOrderByIdAsync(
        int orderId,
        CancellationToken cancellationToken = default
    )
    {
        var orderResult = await _orderRepository.GetByIdWithItemsAsync(orderId, cancellationToken);
        if (orderResult.IsFailure)
            return Result.Failure<OrderDto?>(orderResult.MessageCode);

        if (orderResult.Value == null)
            return Result.Failure<OrderDto?>("Order not found");

        var dto = MapToDto(orderResult.Value);
        return Result.Success<OrderDto?>(dto);
    }

    public async Task<Result<PaginatedResult<OrderDto>>> GetOrdersByUserIdAsync(
        int userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        if (page < MinPage)
            return Result.Failure<PaginatedResult<OrderDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize < MinPageSize || pageSize > MaxPageSize)
            return Result.Failure<PaginatedResult<OrderDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        var ordersResult = await _orderRepository.GetByUserIdPaginatedAsync(
            userId,
            page,
            pageSize,
            cancellationToken
        );
        if (ordersResult.IsFailure)
            return Result.Failure<PaginatedResult<OrderDto>>(ordersResult.MessageCode);

        var orderDtos = ordersResult.Value.Items.Select(MapToDto).ToList();
        var result = new PaginatedResult<OrderDto>(
            orderDtos,
            ordersResult.Value.TotalCount,
            page,
            pageSize
        );

        return Result.Success(result);
    }

    public async Task<Result<PaginatedResult<OrderDto>>> GetPaginatedOrdersAsync(
        int page,
        int pageSize,
        OrderStatus? status = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        if (page < MinPage)
            return Result.Failure<PaginatedResult<OrderDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize < MinPageSize || pageSize > MaxPageSize)
            return Result.Failure<PaginatedResult<OrderDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        var ordersResult = await _orderRepository.GetPaginatedWithItemsAsync(
            page,
            pageSize,
            status,
            activeOnly,
            cancellationToken
        );
        if (ordersResult.IsFailure)
            return Result.Failure<PaginatedResult<OrderDto>>(ordersResult.MessageCode);

        var orderDtos = ordersResult.Value.Items.Select(MapToDto).ToList();
        var result = new PaginatedResult<OrderDto>(
            orderDtos,
            ordersResult.Value.TotalCount,
            page,
            pageSize
        );

        return Result.Success(result);
    }

    private async Task<Result> ValidateCreateOrderDto(
        CreateOrderDto createOrderDto,
        CancellationToken cancellationToken
    )
    {
        // Basic validation
        if (createOrderDto.UserId < MinUserId)
            return Result.Failure("User ID is required");

        if (createOrderDto.ShippingAddressId < MinAddressId)
            return Result.Failure("Shipping address ID is required");

        if (createOrderDto.OrderItems == null || !createOrderDto.OrderItems.Any())
            return Result.Failure("At least one order item is required");

        // Validate order items basic requirements
        foreach (var orderItem in createOrderDto.OrderItems)
        {
            if (orderItem.ProductId < MinProductId)
                return Result.Failure("Product ID is required for all order items");

            if (orderItem.Quantity < MinQuantity)
                return Result.Failure("Quantity must be greater than zero for all order items");
        }

        // Bulk validation - much more efficient than individual queries
        Result[] validationTasks =
        [
            await ValidateUserExistsAsync(createOrderDto.UserId, cancellationToken),
            await ValidateShippingAddressExistsAsync(
                createOrderDto.ShippingAddressId,
                cancellationToken
            ),
            await ValidateProductsExistAsync(
                createOrderDto.OrderItems.Select(oi => oi.ProductId).ToHashSet(),
                cancellationToken
            ),
        ];

        var results = validationTasks.ToList();

        foreach (var result in results)
        {
            if (result.IsFailure)
                return result;
        }

        return Result.Success();
    }

    private async Task<Result> ValidateUserExistsAsync(
        int userId,
        CancellationToken cancellationToken
    )
    {
        var userExistsResult = await _userRepository.AnyAsync(
            u => u.Id == userId && u.IsActive && !u.IsDeleted,
            cancellationToken
        );

        if (userExistsResult.IsFailure)
            return Result.Failure(userExistsResult.MessageCode);

        return !userExistsResult.Value ? Result.Failure("User not found") : Result.Success();
    }

    private async Task<Result> ValidateShippingAddressExistsAsync(
        int addressId,
        CancellationToken cancellationToken
    )
    {
        var addressExistsResult = await _locationRepository.AnyAsync(
            l => l.Id == addressId && l.IsActive && !l.IsDeleted,
            cancellationToken
        );

        if (addressExistsResult.IsFailure)
            return Result.Failure(addressExistsResult.MessageCode);

        return !addressExistsResult.Value
            ? Result.Failure("Shipping address not found")
            : Result.Success();
    }

    private async Task<Result> ValidateProductsExistAsync(
        HashSet<int> productIds,
        CancellationToken cancellationToken
    )
    {
        var existingProductsResult = await _productRepository
            .GetQueryable()
            .Where(p => productIds.Contains(p.Id) && p.IsActive && !p.IsDeleted)
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        if (existingProductsResult.Count != productIds.Count)
        {
            var missingIds = productIds.Except(existingProductsResult).ToList();
            return Result.Failure($"Products not found: {string.Join(", ", missingIds)}");
        }

        return Result.Success();
    }

    private OrderDto MapToDto(Order order)
    {
        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            ShippingAddressId = order.ShippingAddressId,
            Status = order.Status,
            PaymentStatus = order.PaymentStatus,
            PaymentMethod = order.PaymentMethod,
            IsActive = order.IsActive,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,

            // Map User Information
            User =
                order.User == null
                    ? new OrderUserDto()
                    : new OrderUserDto
                    {
                        Id = order.User.Id,
                        Email = order.User.Email,
                        PhoneNumber = order.User.PhoneNumber,
                        ProviderBusinessName = order.User.Provider?.BusinessName,
                        CustomerName = order.User.Customer?.Name,
                    },

            // Map Shipping Address Information
            ShippingAddress =
                order.ShippingAddress == null
                    ? new OrderShippingAddressDto()
                    : new OrderShippingAddressDto
                    {
                        Id = order.ShippingAddress.Id,
                        Name = order.ShippingAddress.Name,
                        Latitude = order.ShippingAddress.Latitude,
                        Longitude = order.ShippingAddress.Longitude,
                        RegionName = order.ShippingAddress.Region?.Name,
                    },

            // Map Order Items with complete related data
            OrderItems =
                order
                    .OrderItems?.Select(oi => new OrderItemDto
                    {
                        Id = oi.Id,
                        OrderId = oi.OrderId,
                        ProductId = oi.ProductId,
                        PostId = oi.PostId,
                        Quantity = oi.Quantity,
                        Price = oi.Price,
                        ProviderId = oi.ProviderId,
                        CurrencyId = oi.CurrencyId,
                        IsActive = oi.IsActive,
                        CreatedAt = oi.CreatedAt,
                        UpdatedAt = oi.UpdatedAt,

                        // Map Product Information
                        Product =
                            oi.Product == null
                                ? new OrderItemProductDto()
                                : new OrderItemProductDto
                                {
                                    Id = oi.Product.Id,
                                    Name = oi.Product.Name,
                                    Description = oi.Product.Description,
                                    CategoryId = oi.Product.CategoryId,
                                    Price = oi.Product.Price,
                                    Quantity = oi.Product.Quantity,
                                    ImageUrl = oi.Product.ProductMedias?.FirstOrDefault()?.Url,
                                    CategoryName = oi.Product.ProductCategory?.Name ?? string.Empty,
                                },

                        // Map Provider Information
                        Provider =
                            oi.Provider == null
                                ? new OrderItemProviderDto()
                                : new OrderItemProviderDto
                                {
                                    UserId = oi.Provider.UserId,
                                    BusinessName = oi.Provider.BusinessName,
                                    Description = oi.Provider.Description,
                                    Rating = oi.Provider.Rating,
                                    ImageUrl = oi.Provider.ProviderMedias?.FirstOrDefault()?.Url,
                                    Email = oi.Provider.User?.Email ?? string.Empty,
                                    PhoneNumber = oi.Provider.User?.PhoneNumber,
                                },

                        // Map Currency Information
                        Currency =
                            oi.Currency == null
                                ? new OrderItemCurrencyDto()
                                : new OrderItemCurrencyDto
                                {
                                    Id = oi.Currency.Id,
                                    Name = oi.Currency.Name,
                                    Code = oi.Currency.Code,
                                    Symbol = oi.Currency.Symbol,
                                },

                        // Map Post Information (if applicable)
                        Post =
                            oi.Post == null
                                ? null
                                : new OrderItemPostDto
                                {
                                    Id = oi.Post.Id,
                                    Description = oi.Post.Description,
                                },

                        // Map Order Item Activities
                        Activities =
                            oi.OrderItemActivities?.Select(a => new OrderItemActivityDto
                                {
                                    Id = a.Id,
                                    OrderItemId = a.OrderItemId,
                                    ActivityType = a.OrderItemActivityType,
                                    ActivityTypeName = a.OrderItemActivityType.ToString(),
                                    ActivityDate = a.ActivityDate,
                                    IsActive = a.IsActive,
                                    CreatedAt = a.CreatedAt,
                                    UpdatedAt = a.UpdatedAt,
                                })
                                .ToList() ?? [],
                    })
                    .ToList() ?? [],

            // Map Order Activities
            OrderActivities =
                order
                    .OrderActivities?.Select(a => new OrderActivityDto
                    {
                        Id = a.Id,
                        OrderId = a.OrderId,
                        ActivityType = a.OrderActivityType,
                        ActivityTypeName = a.OrderActivityType.ToString(),
                        ActivityDate = a.ActivityDate,
                        IsActive = a.IsActive,
                        CreatedAt = a.CreatedAt,
                        UpdatedAt = a.UpdatedAt,
                    })
                    .ToList() ?? [],
        };
    }

    #region Helper Methods

    private static Result ValidateCreateOrderInput(CreateOrderDto? createOrderDto)
    {
        if (createOrderDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        if (createOrderDto.OrderItems == null || !createOrderDto.OrderItems.Any())
            return Result.Failure(MessageCodes.ENTITY_NULL);

        return Result.Success();
    }

    private async Task<Result<T>> ExecuteWithTransactionAsync<T>(
        Func<Task<Result<T>>> operation,
        CancellationToken cancellationToken = default
    )
    {
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<T>(transactionResult.MessageCode);

        try
        {
            var result = await operation();
            if (result.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return result;
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<T>(commitResult.MessageCode);
            }

            return result;
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return Result.Failure<T>(MessageCodes.DB_ERROR);
        }
    }

    private async Task<Result<OrderCreationData>> PrepareOrderCreationDataAsync(
        CreateOrderDto createOrderDto,
        CancellationToken cancellationToken
    )
    {
        // Use Contains for better performance than Any
        var productIds = createOrderDto.OrderItems.Select(oi => oi.ProductId).ToHashSet();
        var products = await _productRepository
            .GetQueryable()
            .Where(p => productIds.Contains(p.Id))
            .ToListAsync(cancellationToken);

        if (products.Count != createOrderDto.OrderItems.Count)
            return Result.Failure<OrderCreationData>(MessageCodes.PRODUCT_NOT_FOUND);

        // Create dictionary lookup for O(1) product access
        var productLookup = products.ToDictionary(p => p.Id, p => p);

        // Calculate total amount efficiently
        var totalAmount = createOrderDto.OrderItems.Sum(orderItem =>
        {
            var product = productLookup[orderItem.ProductId];
            return product.Price * orderItem.Quantity;
        });

        return Result.Success(new OrderCreationData(productLookup, totalAmount));
    }

    private async Task<Result<Order>> CreateOrderWithItemsAsync(
        CreateOrderDto createOrderDto,
        OrderCreationData orderData,
        CancellationToken cancellationToken
    )
    {
        var utcNow = DateTime.UtcNow;

        // Create the order
        var order = new Order
        {
            UserId = createOrderDto.UserId,
            TotalAmount = orderData.TotalAmount,
            ShippingAddressId = createOrderDto.ShippingAddressId,
            Status = OrderStatus.Initial,
            PaymentStatus = OrderPaymentStatus.Unpaid,
            PaymentMethod = OrderPaymentMethod.NoYetSpecified,
            IsActive = true,
            CreatedAt = utcNow,
            UpdatedAt = utcNow,
        };

        var addOrderResult = await _orderRepository.AddAsync(order, cancellationToken);
        if (addOrderResult.IsFailure)
            return Result.Failure<Order>(addOrderResult.MessageCode);

        var saveOrderResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveOrderResult.IsFailure)
            return Result.Failure<Order>(saveOrderResult.MessageCode);

        var createdOrder = addOrderResult.Value!;

        // Create order items in batch for better performance
        var orderItems = createOrderDto
            .OrderItems.Select(createOrderItemDto =>
            {
                var product = orderData.ProductLookup[createOrderItemDto.ProductId];
                return new OrderItem
                {
                    OrderId = createdOrder.Id,
                    ProductId = createOrderItemDto.ProductId,
                    PostId = createOrderItemDto.PostId,
                    Quantity = createOrderItemDto.Quantity,
                    Price = product.Price,
                    ProviderId = product.ProviderId,
                    IsActive = true,
                    CreatedAt = utcNow,
                    UpdatedAt = utcNow,
                };
            })
            .ToList();

        // Add all order items in batch
        foreach (var orderItem in orderItems)
        {
            var addResult = await _orderItemRepository.AddAsync(orderItem, cancellationToken);
            if (addResult.IsFailure)
                return Result.Failure<Order>(addResult.MessageCode);
        }

        var saveFinalResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveFinalResult.IsFailure)
            return Result.Failure<Order>(saveFinalResult.MessageCode);

        return Result.Success(createdOrder);
    }

    #endregion

    #region Data Transfer Objects

    private record OrderCreationData(
        IReadOnlyDictionary<int, Product> ProductLookup,
        decimal TotalAmount
    );

    #endregion
}
