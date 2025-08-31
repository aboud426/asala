using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class ProviderRepository : BaseRepository<Provider, int>, IProviderRepository
{
    public ProviderRepository(AsalaDbContext context) : base(context, p => p.UserId)
    {
    }

    public async Task<Result<Provider?>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var provider = await _dbSet
                .FirstOrDefaultAsync(p => p.UserId == userId, cancellationToken);

            return Result.Success(provider);
        }
        catch (Exception ex)
        {
            return Result.Failure<Provider?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Provider?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            var provider = await (from p in _dbSet
                                join u in _context.Users on p.UserId equals u.Id
                                where u.Email.ToLower() == email.ToLower() && !u.IsDeleted
                                select p).FirstOrDefaultAsync(cancellationToken);

            return Result.Success(provider);
        }
        catch (Exception ex)
        {
            return Result.Failure<Provider?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Provider>>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default)
    {
        try
        {
            var providers = await (from p in _dbSet
                                 join u in _context.Users on p.UserId equals u.Id
                                 where p.ParentId == parentId && !u.IsDeleted
                                 select p).ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Provider>>(providers);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Provider>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Provider>>> GetTopLevelProvidersAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var providers = await (from p in _dbSet
                                 join u in _context.Users on p.UserId equals u.Id
                                 where p.ParentId == null && !u.IsDeleted
                                 select p).ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Provider>>(providers);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Provider>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Provider>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        int? parentId = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            var query = from p in _dbSet
                       join u in _context.Users on p.UserId equals u.Id
                       where !u.IsDeleted
                       select p;

            if (activeOnly.HasValue)
            {
                query = query.Where(p => _context.Users.Where(u => u.Id == p.UserId).First().IsActive == activeOnly.Value);
            }

            if (parentId.HasValue)
            {
                query = query.Where(p => p.ParentId == parentId.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var providers = await query
                .OrderBy(p => p.BusinessName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Provider>(
                providers,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Provider>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
