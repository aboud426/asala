using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Categories.Db;

public class CategoryRepository : Repository<Category, int>, ICategoryRepository
{
    public CategoryRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<IEnumerable<int>>> GetCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This query finds categories that don't have translations for all active languages
            // It works by:
            // 1. Getting the cross product of active categories and active languages
            // 2. Left joining with existing category localizations
            // 3. Finding combinations where no localization exists
            // 4. Grouping by category and counting missing translations
            // 5. Returning categories that have missing translations
            var query =
                from category in _context.Categories
                where category.IsActive && !category.IsDeleted
                from language in _context.Languages
                where language.IsActive && !language.IsDeleted
                join localization in _context.CategoryLocalizeds
                    on new { CategoryId = category.Id, LanguageId = language.Id } equals new
                    {
                        CategoryId = localization.CategoryId,
                        LanguageId = localization.LanguageId,
                    }
                    into localizations
                from localization in localizations.DefaultIfEmpty()
                where localization == null || localization.IsDeleted || !localization.IsActive
                select new { CategoryId = category.Id, LanguageId = language.Id };

            var missingTranslations = await query
                .GroupBy(x => x.CategoryId)
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
