using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface ICartItemRepository : IRepository<CartItem, int>
{
    Task<Result<IEnumerable<CartItem>>> GetByCartIdAsync(int cartId, CancellationToken cancellationToken = default);
    Task<Result<CartItem?>> GetByCartAndProductAsync(int cartId, int productId, int postId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<CartItem>>> GetPaginatedByCartIdAsync(
        int cartId,
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
