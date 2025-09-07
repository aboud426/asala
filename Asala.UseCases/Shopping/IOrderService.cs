using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.DTOs;

namespace Asala.UseCases.Shopping;

public interface IOrderService
{
    Task<Result<OrderDto>> GetOrderByIdAsync(int userId, int orderId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<OrderSummaryDto>>> GetUserOrdersAsync(int userId, int page, int pageSize, CancellationToken cancellationToken = default);
}
