using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class CurrencyRepository : Repository<Currency, int>, ICurrencyRepository
{
    public CurrencyRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<Currency?>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var currency = await _dbSet
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Name.ToLower() == name.ToLower(), cancellationToken);

            return Result.Success(currency);
        }
        catch (Exception ex)
        {
            return Result.Failure<Currency?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Currency?>> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        try
        {
            var currency = await _dbSet
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Code.ToUpper() == code.ToUpper(), cancellationToken);

            return Result.Success(currency);
        }
        catch (Exception ex)
        {
            return Result.Failure<Currency?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(c => !c.IsDeleted && c.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByCodeAsync(string code, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(c => !c.IsDeleted && c.Code.ToUpper() == code.ToUpper());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Currency>>> GetPaginatedWithLocalizationsAsync(
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

            IQueryable<Currency> query = _dbSet.Where(c => !c.IsDeleted);

            if (activeOnly.HasValue)
            {
                query = query.Where(c => c.IsActive == activeOnly.Value);
            }

            // Include localizations and their languages
            query = query
                .Include(c => c.Localizations.Where(l => !l.IsDeleted))
                .ThenInclude(l => l.Language);

            var totalCount = await query.CountAsync(cancellationToken);

            var currencies = await query
                .OrderBy(c => c.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<Currency>(
                currencies,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Currency>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetCurrenciesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This query finds currencies that don't have translations for all active languages
            // It works by:
            // 1. Getting the cross product of active currencies and active languages
            // 2. Left joining with existing currency localizations
            // 3. Finding combinations where no localization exists
            // 4. Grouping by currency and counting missing translations
            // 5. Returning currencies that have missing translations
            var query =
                from currency in _context.Currencies
                where currency.IsActive && !currency.IsDeleted
                from language in _context.Languages
                where language.IsActive && !language.IsDeleted
                join localization in _context.CurrencyLocalizations
                    on new { CurrencyId = currency.Id, LanguageId = language.Id } equals new
                    {
                        CurrencyId = localization.CurrencyId,
                        LanguageId = localization.LanguageId,
                    }
                    into localizations
                from localization in localizations.DefaultIfEmpty()
                where localization == null || localization.IsDeleted || !localization.IsActive
                select new { CurrencyId = currency.Id, LanguageId = language.Id };

            var missingTranslations = await query
                .GroupBy(x => x.CurrencyId)
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
