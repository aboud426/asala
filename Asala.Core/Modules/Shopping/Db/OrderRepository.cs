using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class OrderRepository : Repository<Order, int>, IOrderRepository
{
    public OrderRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<IEnumerable<Order>>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.OrderActivities)
                    .ThenInclude(oa => oa.OrderStatus)
                .Where(o => o.UserId == userId && !o.IsDeleted)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Order>>(orders);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Order>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Order?>> GetByIdWithDetailsAsync(int id, CancellationToken cancellationToken = default)
    {
        try
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Provider)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.OrderItemActivities)
                        .ThenInclude(oia => oia.OrderItemStatus)
                .Include(o => o.OrderActivities)
                    .ThenInclude(oa => oa.OrderStatus)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted, cancellationToken);

            return Result.Success(order);
        }
        catch (Exception ex)
        {
            return Result.Failure<Order?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Order>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        int? userId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.OrderItems)
                .Include(o => o.OrderActivities)
                    .ThenInclude(oa => oa.OrderStatus)
                .Where(o => !o.IsDeleted);

            if (userId.HasValue)
                query = query.Where(o => o.UserId == userId.Value);

            if (activeOnly.HasValue)
                query = query.Where(o => o.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<Order>(
                items: orders,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Order>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Order>>> GetByProviderIdAsync(int providerId, CancellationToken cancellationToken = default)
    {
        try
        {
            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                .Include(o => o.OrderActivities)
                    .ThenInclude(oa => oa.OrderStatus)
                .Where(o => o.OrderItems.Any(oi => oi.ProviderId == providerId) && !o.IsDeleted)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Order>>(orders);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Order>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
