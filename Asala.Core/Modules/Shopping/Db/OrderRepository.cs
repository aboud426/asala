using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class OrderRepository : Repository<Order, int>, IOrderRepository
{
    public OrderRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<Order?>> GetByIdWithItemsAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var order = await _context
                .Orders
                // Include User with related data
                .Include(o => o.User)
                    .ThenInclude(u => u.Provider)
                .Include(o => o.User)
                    .ThenInclude(u => u.Customer)
                    
                // Include Shipping Address with region
                .Include(o => o.ShippingAddress)
                    .ThenInclude(sa => sa.Region)
                    
                // Include Order Items with complete related data
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.ProductCategory)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.ProductMedias)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Provider)
                        .ThenInclude(p => p.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Provider)
                        .ThenInclude(p => p.ProviderMedias)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Currency)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Post)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.OrderItemActivities)
                    
                // Include Order Activities
                .Include(o => o.OrderActivities)
                .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted, cancellationToken);

            return Result.Success(order);
        }
        catch (Exception ex)
        {
            return Result.Failure<Order?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Order>>> GetByUserIdPaginatedAsync(
        int userId,
        int page,
        int pageSize,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .Orders
                // Include User with related data
                .Include(o => o.User)
                    .ThenInclude(u => u.Provider)
                .Include(o => o.User)
                    .ThenInclude(u => u.Customer)
                    
                // Include Shipping Address
                .Include(o => o.ShippingAddress)
                    .ThenInclude(sa => sa.Region)
                    
                // Include Order Items with basic related data
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.ProductMedias)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Provider)
                        .ThenInclude(p => p.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Currency)
                .Where(o => o.UserId == userId && !o.IsDeleted);

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

    public async Task<Result<PaginatedResult<Order>>> GetPaginatedWithItemsAsync(
        int page,
        int pageSize,
        OrderStatus? status = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .Orders
                // Include User with related data
                .Include(o => o.User)
                    .ThenInclude(u => u.Provider)
                .Include(o => o.User)
                    .ThenInclude(u => u.Customer)
                    
                // Include Shipping Address
                .Include(o => o.ShippingAddress)
                    .ThenInclude(sa => sa.Region)
                    
                // Include Order Items with complete related data
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.ProductCategory)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.ProductMedias)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Provider)
                        .ThenInclude(p => p.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Currency)
                .Where(o => !o.IsDeleted);

            if (status.HasValue)
                query = query.Where(o => o.Status == status.Value);

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
}
