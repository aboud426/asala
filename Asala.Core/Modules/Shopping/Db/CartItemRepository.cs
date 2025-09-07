using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class CartItemRepository : Repository<CartItem, int>, ICartItemRepository
{
    public CartItemRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<IEnumerable<CartItem>>> GetByCartIdAsync(int cartId, CancellationToken cancellationToken = default)
    {
        try
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Include(ci => ci.Post)
                .Where(ci => ci.CartId == cartId && !ci.IsDeleted)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<CartItem>>(cartItems);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<CartItem>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<CartItem?>> GetByCartAndProductAsync(int cartId, int productId, int postId, CancellationToken cancellationToken = default)
    {
        try
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.CartId == cartId && ci.ProductId == productId && ci.PostId == postId && !ci.IsDeleted, cancellationToken);

            return Result.Success(cartItem);
        }
        catch (Exception ex)
        {
            return Result.Failure<CartItem?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<CartItem>>> GetPaginatedByCartIdAsync(
        int cartId,
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _context.CartItems
                .Include(ci => ci.Product)
                .Include(ci => ci.Post)
                .Where(ci => ci.CartId == cartId && !ci.IsDeleted);

            if (activeOnly.HasValue)
                query = query.Where(ci => ci.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var cartItems = await query
                .OrderByDescending(ci => ci.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<CartItem>(
                items: cartItems,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<CartItem>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
