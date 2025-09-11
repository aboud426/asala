using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class OrderItemRepository : Repository<OrderItem, int>, IOrderItemRepository
{
    public OrderItemRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<List<OrderItem>>> GetByOrderIdAsync(int orderId, CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Provider)
                .Include(oi => oi.Post)
                .Where(oi => oi.OrderId == orderId && !oi.IsDeleted)
                .ToListAsync(cancellationToken);

            return Result.Success(orderItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<List<OrderItem>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<OrderItem?>> GetByOrderIdAndProductIdAsync(
        int orderId,
        int productId,
        int? postId = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var orderItem = await _context.OrderItems
                .Include(oi => oi.Product)
                .Include(oi => oi.Provider)
                .Include(oi => oi.Post)
                .FirstOrDefaultAsync(oi => 
                    oi.OrderId == orderId && 
                    oi.ProductId == productId && 
                    oi.PostId == postId &&
                    !oi.IsDeleted, 
                    cancellationToken);

            return Result.Success(orderItem);
        }
        catch (Exception ex)
        {
            return Result.Failure<OrderItem?>(MessageCodes.DB_ERROR, ex);
        }
    }
}
