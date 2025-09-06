using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class ProviderRepository : BaseRepository<Provider, int>, IProviderRepository
{
    public ProviderRepository(AsalaDbContext context)
        : base(context, p => p.UserId) { }

    public async Task<Result<Provider?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var provider = await _dbSet.FirstOrDefaultAsync(
                p => p.UserId == userId,
                cancellationToken
            );

            return Result.Success(provider);
        }
        catch (Exception ex)
        {
            return Result.Failure<Provider?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Provider?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var provider = await (
                from p in _dbSet
                join u in _context.Users on p.UserId equals u.Id
                where u.Email.ToLower() == email.ToLower() && !u.IsDeleted
                select p
            ).FirstOrDefaultAsync(cancellationToken);

            return Result.Success(provider);
        }
        catch (Exception ex)
        {
            return Result.Failure<Provider?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Provider>>> GetByParentIdAsync(
        int parentId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var providers = await (
                from p in _dbSet
                join u in _context.Users on p.UserId equals u.Id
                where p.ParentId == parentId && !u.IsDeleted
                select p
            ).ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Provider>>(providers);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Provider>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Provider>>> GetTopLevelProvidersAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var providers = await (
                from p in _dbSet
                join u in _context.Users on p.UserId equals u.Id
                where p.ParentId == null && !u.IsDeleted
                select p
            ).ToListAsync(cancellationToken);

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
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            var query =
                from p in _dbSet
                join u in _context.Users on p.UserId equals u.Id
                where !u.IsDeleted
                select p;

            if (activeOnly.HasValue)
            {
                query = query.Where(p => p.User.IsActive == activeOnly.Value);
            }

            if (parentId.HasValue)
            {
                query = query.Where(p => p.ParentId == parentId.Value);
            }
            query = query
                .Include(p => p.User)
                .Include(p => p.ProviderLocalizeds)
                .ThenInclude(p => p.Language)
                .Include(p => p.ProviderMedias);

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

    public async Task<Result<PaginatedResult<Provider>>> SearchByBusinessNameAsync(
        string searchTerm,
        int page,
        int pageSize,
        bool? activeOnly = null,
        ProviderSortBy sortBy = ProviderSortBy.Name,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetPaginatedWithUserAsync(
                    page,
                    pageSize,
                    activeOnly,
                    null,
                    cancellationToken
                );

            var searchPattern = $"%{searchTerm.Trim()}%";

            var query =
                from p in _dbSet
                join u in _context.Users on p.UserId equals u.Id
                from pl in _context
                    .Set<ProviderLocalized>()
                    .Where(x => x.ProviderId == p.UserId && !x.IsDeleted)
                    .DefaultIfEmpty()
                where
                    !u.IsDeleted
                    && (
                        EF.Functions.Like(p.BusinessName, searchPattern)
                        || EF.Functions.Like(p.Description, searchPattern)
                        || (
                            pl != null
                            && (
                                EF.Functions.Like(pl.BusinessNameLocalized, searchPattern)
                                || EF.Functions.Like(pl.DescriptionLocalized, searchPattern)
                            )
                        )
                    )
                select p;

            if (activeOnly.HasValue)
            {
                query = query.Where(p =>
                    _context.Users.Any(u => u.Id == p.UserId && u.IsActive == activeOnly.Value)
                );
            }

            // Use Distinct to avoid duplicates when multiple localizations match
            var distinctQuery = query.Distinct();

            var totalCount = await distinctQuery.CountAsync(cancellationToken);

            // Apply sorting based on sortBy parameter
            distinctQuery = sortBy switch
            {
                ProviderSortBy.Name => distinctQuery.OrderBy(p => p.BusinessName),
                ProviderSortBy.Rating => distinctQuery
                    .OrderByDescending(p => p.Rating)
                    .ThenBy(p => p.BusinessName),
                _ => distinctQuery.OrderBy(p => p.BusinessName),
            };

            var providers = await distinctQuery
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
