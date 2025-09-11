using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface IOrderItemRepository : IRepository<OrderItem, int>
{
    Task<Result<List<OrderItem>>> GetByOrderIdAsync(int orderId, CancellationToken cancellationToken = default);
    Task<Result<OrderItem?>> GetByOrderIdAndProductIdAsync(
        int orderId,
        int productId,
        int? postId = null,
        CancellationToken cancellationToken = default
    );
}
