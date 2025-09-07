using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class OrderItemRepository : Repository<OrderItem, int>, IOrderItemRepository
{
    public OrderItemRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<IEnumerable<OrderItem>>> GetByOrderIdAsync(int orderId, CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Provider)
                .Include(oi => oi.Post)
                .Include(oi => oi.OrderItemActivities)
                    .ThenInclude(oia => oia.OrderItemStatus)
                .Where(oi => oi.OrderId == orderId && !oi.IsDeleted)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<OrderItem>>(orderItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<OrderItem>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<OrderItem>>> GetByProviderIdAsync(int providerId, CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Order)
                    .ThenInclude(o => o.User)
                .Include(oi => oi.OrderItemActivities)
                    .ThenInclude(oia => oia.OrderItemStatus)
                .Where(oi => oi.ProviderId == providerId && !oi.IsDeleted)
                .OrderByDescending(oi => oi.CreatedAt)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<OrderItem>>(orderItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<OrderItem>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<OrderItem?>> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Provider)
                .Include(oi => oi.Post)
                .Include(oi => oi.Order)
                    .ThenInclude(o => o.User)
                .Include(oi => oi.OrderItemActivities)
                    .ThenInclude(oia => oia.OrderItemStatus)
                .FirstOrDefaultAsync(oi => oi.Id == id && !oi.IsDeleted, cancellationToken);

            return Result.Success(orderItem);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderItem?>(MessageCodes.DB_ERROR, ex);
        }
    }
}
