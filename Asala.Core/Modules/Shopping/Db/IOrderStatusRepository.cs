using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Shopping.Models;

namespace Asala.Core.Modules.Shopping.Db;

public interface IOrderStatusRepository : IRepository<OrderStatus, int>
{
    Task<Result<OrderStatus?>> GetByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<OrderStatus>>> GetActiveStatusesAsync(CancellationToken cancellationToken = default);
}
