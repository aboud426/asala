using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface IOrderRepository : IRepository<Order, int>
{
    Task<Result<Order?>> GetByIdWithItemsAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Order>>> GetByUserIdPaginatedAsync(
        int userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    );
    Task<Result<PaginatedResult<Order>>> GetPaginatedWithItemsAsync(
        int page,
        int pageSize,
        OrderStatus? status = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
