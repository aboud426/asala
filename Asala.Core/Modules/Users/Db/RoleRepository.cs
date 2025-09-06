using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class RoleRepository : Repository<Role, int>, IRoleRepository
{
    public RoleRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<Role?>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var role = await _dbSet
                .Where(r => !r.IsDeleted)
                .FirstOrDefaultAsync(r => r.Name.ToLower() == name.ToLower(), cancellationToken);

            return Result.Success(role);
        }
        catch (Exception ex)
        {
            return Result.Failure<Role?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(r => !r.IsDeleted && r.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(r => r.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Role>>> GetPaginatedWithLocalizationsAsync(
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

            IQueryable<Role> query = _dbSet.Where(r => !r.IsDeleted);

            if (activeOnly.HasValue)
            {
                query = query.Where(r => r.IsActive == activeOnly.Value);
            }

            // Include localizations and their languages
            query = query
                .Include(r => r.Localizations.Where(l => !l.IsDeleted))
                .ThenInclude(l => l.Language);

            var totalCount = await query.CountAsync(cancellationToken);

            var roles = await query
                .OrderBy(r => r.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Role>(
                roles,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Role>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetRolesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This query finds roles that don't have translations for all active languages
            // It works by:
            // 1. Getting the cross product of active roles and active languages
            // 2. Left joining with existing role localizations
            // 3. Finding combinations where no localization exists
            // 4. Grouping by role and counting missing translations
            // 5. Returning roles that have missing translations
            var query =
                from role in _context.Roles
                where role.IsActive && !role.IsDeleted
                from language in _context.Languages
                where language.IsActive && !language.IsDeleted
                join localization in _context.RoleLocalizations
                    on new { RoleId = role.Id, LanguageId = language.Id } equals new
                    {
                        RoleId = localization.RoleId,
                        LanguageId = localization.LanguageId,
                    }
                    into localizations
                from localization in localizations.DefaultIfEmpty()
                where localization == null || localization.IsDeleted || !localization.IsActive
                select new { RoleId = role.Id, LanguageId = language.Id };

            var missingTranslations = await query
                .GroupBy(x => x.RoleId)
                .Select(g => g.Key)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<int>>(missingTranslations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<int>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
