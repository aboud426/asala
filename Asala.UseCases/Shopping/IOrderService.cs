using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.DTOs;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.UseCases.Shopping;

public interface IOrderService
{
    Task<Result<OrderDto?>> CreateOrderAsync(
        CreateOrderDto createOrderDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<OrderDto?>> GetOrderByIdAsync(
        int orderId,
        CancellationToken cancellationToken = default
    );

    Task<Result<PaginatedResult<OrderDto>>> GetOrdersByUserIdAsync(
        int userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    );

    Task<Result<PaginatedResult<OrderDto>>> GetPaginatedOrdersAsync(
        int page,
        int pageSize,
        OrderStatus? status = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
