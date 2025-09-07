using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class OrderStatusRepository : Repository<OrderStatus, int>, IOrderStatusRepository
{
    public OrderStatusRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<OrderStatus?>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var orderStatus = await _context.OrderStatuses
                .FirstOrDefaultAsync(os => os.Name == name && !os.IsDeleted, cancellationToken);

            return Result.Success(orderStatus);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderStatus?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<OrderStatus>>> GetActiveStatusesAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var orderStatuses = await _context.OrderStatuses
                .Where(os => os.IsActive && !os.IsDeleted)
                .OrderBy(os => os.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<OrderStatus>>(orderStatuses);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<OrderStatus>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
