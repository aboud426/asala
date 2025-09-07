using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class OrderItemStatusRepository : Repository<OrderItemStatus, int>, IOrderItemStatusRepository
{
    public OrderItemStatusRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<OrderItemStatus?>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItemStatus = await _context.OrderItemStatuses
                .FirstOrDefaultAsync(ois => ois.Name == name && !ois.IsDeleted, cancellationToken);

            return Result.Success(orderItemStatus);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderItemStatus?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<OrderItemStatus>>> GetActiveStatusesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItemStatuses = await _context.OrderItemStatuses
                .Where(ois => ois.IsActive && !ois.IsDeleted)
                .OrderBy(ois => ois.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<OrderItemStatus>>(orderItemStatuses);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<OrderItemStatus>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
