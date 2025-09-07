using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface IOrderItemStatusRepository : IRepository<OrderItemStatus, int>
{
    Task<Result<OrderItemStatus?>> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<OrderItemStatus>>> GetActiveStatusesAsync(CancellationToken cancellationToken = default);
}
