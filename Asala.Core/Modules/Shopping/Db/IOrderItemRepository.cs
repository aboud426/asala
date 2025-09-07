using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface IOrderItemRepository : IRepository<OrderItem, int>
{
    Task<Result<IEnumerable<OrderItem>>> GetByOrderIdAsync(int orderId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<OrderItem>>> GetByProviderIdAsync(int providerId, CancellationToken cancellationToken = default);
    Task<Result<OrderItem?>> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default);
}
