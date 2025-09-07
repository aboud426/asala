using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface ICartRepository : IRepository<Cart, int>
{
    Task<Result<Cart?>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<Cart?>> GetByUserIdWithItemsAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Cart>>> GetPaginatedWithItemsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
