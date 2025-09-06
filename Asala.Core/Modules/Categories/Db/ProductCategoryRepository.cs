using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Categories.Db;

public class ProductCategoryRepository
    : Repository<ProductCategory, int>,
        IProductCategoryRepository
{
    public ProductCategoryRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<IEnumerable<int>>> GetProductCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // This query finds product categories that don't have translations for all active languages
            // It works by:
            // 1. Getting the cross product of active product categories and active languages
            // 2. Left joining with existing product category localizations
            // 3. Finding combinations where no localization exists
            // 4. Grouping by product category and counting missing translations
            // 5. Returning product categories that have missing translations
            var query =
                from productCategory in _context.ProductCategories
                where productCategory.IsActive && !productCategory.IsDeleted
                from language in _context.Languages
                where language.IsActive && !language.IsDeleted
                join localization in _context.ProductCategoryLocalizeds
                    on new
                    {
                        ProductCategoryId = productCategory.Id,
                        LanguageId = language.Id,
                    } equals new
                    {
                        ProductCategoryId = localization.CategoryId,
                        LanguageId = localization.LanguageId,
                    }
                    into localizations
                from localization in localizations.DefaultIfEmpty()
                where localization == null || localization.IsDeleted || !localization.IsActive
                select new { ProductCategoryId = productCategory.Id, LanguageId = language.Id };

            var missingTranslations = await query
                .GroupBy(x => x.ProductCategoryId)
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
