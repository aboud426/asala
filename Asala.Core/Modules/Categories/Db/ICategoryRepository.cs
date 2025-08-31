using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public interface ICategoryRepository : IRepository<Category, int> 
{
    Task<Result<IEnumerable<int>>> GetCategoriesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
