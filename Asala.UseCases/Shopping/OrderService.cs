using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Db;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Shopping.Db;
using Asala.Core.Modules.Shopping.DTOs;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Shopping;

public class OrderService : IOrderService
{
    private readonly IOrderRepository _orderRepository;
    private readonly IOrderItemRepository _orderItemRepository;
    private readonly IProductRepository _productRepository;
    private readonly ILocationRepository _locationRepository;
    private readonly IProviderRepository _providerRepository;

    public OrderService(
        IOrderRepository orderRepository,
        IOrderItemRepository orderItemRepository,
        IProductRepository productRepository,
        ILocationRepository locationRepository,
        IProviderRepository providerRepository)
    {
        _orderRepository = orderRepository;
        _orderItemRepository = orderItemRepository;
        _productRepository = productRepository;
        _locationRepository = locationRepository;
        _providerRepository = providerRepository;
    }

    public async Task<Result<OrderDto>> GetOrderByIdAsync(int userId, int orderId, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get order with details
            var orderResult = await _orderRepository.GetByIdWithDetailsAsync(orderId, cancellationToken);
            if (!orderResult.IsSuccess)
                return Result.Failure<OrderDto>(orderResult.MessageCode);

            if (orderResult.Value == null)
                return Result.Failure<OrderDto>(MessageCodes.ORDER_NOT_FOUND);

            var order = orderResult.Value;

            // Verify the order belongs to the user
            if (order.UserId != userId)
                return Result.Failure<OrderDto>(MessageCodes.ORDER_NOT_FOUND);

            // Map to detailed DTO
            var orderDto = await MapToDetailedOrderDtoAsync(order, cancellationToken);
            return Result.Success(orderDto);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderDto>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<OrderSummaryDto>>> GetUserOrdersAsync(int userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        try
        {
            // Get paginated orders for user
            var ordersResult = await _orderRepository.GetPaginatedWithDetailsAsync(
                page, pageSize, userId, true, cancellationToken);
            
            if (!ordersResult.IsSuccess)
                return Result.Failure<PaginatedResult<OrderSummaryDto>>(ordersResult.MessageCode);

            var paginatedOrders = ordersResult.Value;
            
            // Map to summary DTOs
            var orderSummaries = new List<OrderSummaryDto>();
            foreach (var order in paginatedOrders.Items)
            {
                var summary = await MapToOrderSummaryDtoAsync(order, cancellationToken);
                orderSummaries.Add(summary);
            }

            var result = new PaginatedResult<OrderSummaryDto>(
                orderSummaries,
                paginatedOrders.TotalCount,
                paginatedOrders.Page,
                paginatedOrders.PageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<OrderSummaryDto>>(MessageCodes.EXECUTION_ERROR, ex);
        }
    }

    private async Task<OrderDto> MapToDetailedOrderDtoAsync(Core.Modules.Shopping.Models.Order order, CancellationToken cancellationToken)
    {
        // Get shipping address details
        var shippingAddress = string.Empty;
        if (order.ShippingAddress != null)
        {
            shippingAddress = $"{order.ShippingAddress.Name}";
        }
        else
        {
            var locationResult = await _locationRepository.GetByIdAsync(order.ShippingAddressId, cancellationToken);
            if (locationResult.IsSuccess && locationResult.Value != null)
            {
                shippingAddress = locationResult.Value.Name;
            }
        }

        // Get current status from latest activity
        var currentStatus = "Pending";
        if (order.OrderActivities.Any())
        {
            var latestActivity = order.OrderActivities
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefault();
            if (latestActivity?.OrderStatus != null)
            {
                currentStatus = latestActivity.OrderStatus.Name;
            }
        }

        // Map order items with detailed information
        var orderItemDtos = new List<OrderItemDto>();
        foreach (var item in order.OrderItems.Where(i => !i.IsDeleted && i.IsActive))
        {
            var itemDto = await MapToDetailedOrderItemDtoAsync(item, cancellationToken);
            orderItemDtos.Add(itemDto);
        }

        // Map order activities
        var orderActivityDtos = order.OrderActivities
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new OrderActivityDto
            {
                Id = a.Id,
                OrderStatusId = a.OrderStatusId,
                OrderId = a.OrderId,
                StatusName = a.OrderStatus?.Name ?? "Unknown",
                CreatedAt = a.CreatedAt,
                IsActive = a.IsActive
            }).ToList();

        return new OrderDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            ShippingAddressId = order.ShippingAddressId,
            ShippingAddress = shippingAddress,
            CurrentStatus = currentStatus,
            IsActive = order.IsActive,
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt,
            OrderItems = orderItemDtos,
            OrderActivities = orderActivityDtos
        };
    }

    private async Task<OrderItemDto> MapToDetailedOrderItemDtoAsync(Core.Modules.Shopping.Models.OrderItem item, CancellationToken cancellationToken)
    {
        // Get product details
        var productName = "Unknown Product";
        var productImageUrl = (string?)null;
        if (item.Product != null)
        {
            productName = item.Product.Name;
            // Get first image from ProductMedias
            var firstImage = item.Product.ProductMedias?.FirstOrDefault(m => m.MediaType == MediaTypeEnum.Image);
            productImageUrl = firstImage?.Url;
        }
        else
        {
            var productResult = await _productRepository.GetByIdAsync(item.ProductId, cancellationToken);
            if (productResult.IsSuccess && productResult.Value != null)
            {
                productName = productResult.Value.Name;
                // Get first image from ProductMedias
                var firstImage = productResult.Value.ProductMedias?.FirstOrDefault(m => m.MediaType == MediaTypeEnum.Image);
                productImageUrl = firstImage?.Url;
            }
        }

        // Get provider details
        var providerName = "Unknown Provider";
        if (item.Provider != null)
        {
            providerName = item.Provider.BusinessName ?? "Unknown Provider";
        }
        else
        {
            var providerResult = await _providerRepository.GetByIdAsync(item.ProviderId, cancellationToken);
            if (providerResult.IsSuccess && providerResult.Value != null)
            {
                providerName = providerResult.Value.BusinessName ?? "Unknown Provider";
            }
        }

        // Get current item status
        var currentStatus = "Pending";
        if (item.OrderItemActivities.Any())
        {
            var latestActivity = item.OrderItemActivities
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefault();
            if (latestActivity?.OrderItemStatus != null)
            {
                currentStatus = latestActivity.OrderItemStatus.Name;
            }
        }

        // Map item activities
        var itemActivityDtos = item.OrderItemActivities
            .OrderByDescending(a => a.CreatedAt)
            .Select(a => new OrderItemActivityDto
            {
                Id = a.Id,
                OrderItemStatusId = a.OrderItemStatusId,
                OrderItemId = a.OrderItemId,
                StatusName = a.OrderItemStatus?.Name ?? "Unknown",
                CreatedAt = a.CreatedAt,
                IsActive = a.IsActive
            }).ToList();

        return new OrderItemDto
        {
            Id = item.Id,
            OrderId = item.OrderId,
            ProductId = item.ProductId,
            PostId = item.PostId,
            Quantity = item.Quantity,
            Price = item.Price,
            ProviderId = item.ProviderId,
            ProductName = productName,
            ProviderName = providerName,
            ProductImageUrl = productImageUrl,
            CurrentStatus = currentStatus,
            IsActive = item.IsActive,
            CreatedAt = item.CreatedAt,
            Activities = itemActivityDtos
        };
    }

    private async Task<OrderSummaryDto> MapToOrderSummaryDtoAsync(Core.Modules.Shopping.Models.Order order, CancellationToken cancellationToken)
    {
        // Get current status
        var currentStatus = "Pending";
        if (order.OrderActivities.Any())
        {
            var latestActivity = order.OrderActivities
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefault();
            if (latestActivity?.OrderStatus != null)
            {
                currentStatus = latestActivity.OrderStatus.Name;
            }
        }

        // Count active items
        var itemCount = order.OrderItems.Count(i => !i.IsDeleted && i.IsActive);

        return new OrderSummaryDto
        {
            Id = order.Id,
            UserId = order.UserId,
            TotalAmount = order.TotalAmount,
            CurrentStatus = currentStatus,
            CreatedAt = order.CreatedAt,
            ItemCount = itemCount
        };
    }
}
