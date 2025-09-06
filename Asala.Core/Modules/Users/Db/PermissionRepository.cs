using System.Linq.Expressions;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class PermissionRepository : Repository<Permission, int>, IPermissionRepository
{
    public PermissionRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<Permission?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var permission = await _dbSet
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync(p => p.Name.ToLower() == name.ToLower(), cancellationToken);

            return Result.Success(permission);
        }
        catch (Exception ex)
        {
            return Result.Failure<Permission?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByNameAsync(
        string name,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _dbSet.Where(p => !p.IsDeleted && p.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(p => p.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Permission>>> GetPaginatedWithLocalizationsAsync(
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

            IQueryable<Permission> query = _dbSet.Where(p => !p.IsDeleted);

            if (activeOnly.HasValue)
            {
                query = query.Where(p => p.IsActive == activeOnly.Value);
            }

            // Include localizations and their languages
            query = query
                .Include(p => p.Localizations.Where(l => !l.IsDeleted))
                .ThenInclude(l => l.Language);

            var totalCount = await query.CountAsync(cancellationToken);

            var permissions = await query
                .OrderBy(p => p.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Permission>(
                permissions,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Permission>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetPermissionsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This query finds permissions that don't have translations for all active languages
            var query =
                from permission in _context.Permissions
                where permission.IsActive && !permission.IsDeleted
                from language in _context.Languages
                where language.IsActive && !language.IsDeleted
                join localization in _context.PermissionLocalizations
                    on new { PermissionId = permission.Id, LanguageId = language.Id } equals new
                    {
                        PermissionId = localization.PermissionId,
                        LanguageId = localization.LanguageId,
                    }
                    into localizations
                from localization in localizations.DefaultIfEmpty()
                where localization == null || localization.IsDeleted || !localization.IsActive
                select new { PermissionId = permission.Id, LanguageId = language.Id };

            var missingTranslations = await query
                .GroupBy(x => x.PermissionId)
                .Select(g => g.Key)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<int>>(missingTranslations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<int>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Permission>>> GetWithLocalizationsAsync(
        Expression<Func<Permission, bool>> filter
    )
    {
        try
        {
            var permissions = await _dbSet
                .Where(filter)
                .Include(p => p.Localizations)
                .ThenInclude(l => l.Language)
                .ToListAsync();
            return Result.Success<IEnumerable<Permission>>(permissions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Permission>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
