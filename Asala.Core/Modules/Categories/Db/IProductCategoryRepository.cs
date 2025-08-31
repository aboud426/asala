using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public interface IProductCategoryRepository : IRepository<ProductCategory, int> 
{
    /// <summary>
    /// Gets product category IDs that are missing translations
    /// </summary>
    Task<Result<IEnumerable<int>>> GetProductCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
