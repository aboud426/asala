using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface IOrderRepository : IRepository<Order, int>
{
    Task<Result<IEnumerable<Order>>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<Order?>> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Order>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        int? userId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<Order>>> GetByProviderIdAsync(int providerId, CancellationToken cancellationToken = default);
}
