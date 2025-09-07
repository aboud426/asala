using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Shopping.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Shopping.Db;

public class CartRepository : Repository<Cart, int>, ICartRepository
{
    public CartRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<Cart?>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var cart = await _context.Carts
                .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted, cancellationToken);

            return Result.Success(cart);
        }
        catch (Exception ex)
        {
            return Result.Failure<Cart?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Cart?>> GetByUserIdWithItemsAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var cart = await _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Post)
                .Include(c => c.User)
                .FirstOrDefaultAsync(c => c.UserId == userId && !c.IsDeleted, cancellationToken);

            return Result.Success(cart);
        }
        catch (Exception ex)
        {
            return Result.Failure<Cart?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Cart>>> GetPaginatedWithItemsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _context.Carts
                .Include(c => c.CartItems)
                    .ThenInclude(ci => ci.Product)
                .Include(c => c.User)
                .Where(c => !c.IsDeleted);

            if (activeOnly.HasValue)
                query = query.Where(c => c.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var carts = await query
                .OrderByDescending(c => c.UpdatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<Cart>(
                items: carts,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Cart>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
