using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class CustomerRepository : BaseRepository<Customer, int>, ICustomerRepository
{
    public CustomerRepository(AsalaDbContext context)
        : base(context, c => c.UserId) { }

    public async Task<Result<Customer?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var customer = await _dbSet
                .Include(e => e.User)
                .FirstOrDefaultAsync(c => c.UserId == userId, cancellationToken);

            return Result.Success(customer);
        }
        catch (Exception ex)
        {
            return Result.Failure<Customer?>(MessageCodes.DB_ERROR, ex);
        }
    }
    public async Task<Result<PaginatedResult<Customer>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            var query = _dbSet.Include(e => e.User).AsQueryable();

            if (activeOnly.HasValue)
            {
                query = query.Where(c => c.User.IsActive == activeOnly.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var customers = await query
                .OrderByDescending(c => c.UserId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Customer>(
                customers,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Customer>>(MessageCodes.DB_ERROR, ex);
        }
    }

}
