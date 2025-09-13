using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.ClientPages.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.ClientPages.Db;

public class ProductsPagesLocalizedRepository
    : Repository<ProductsPagesLocalized, int>,
        IProductsPagesLocalizedRepository
{
    public ProductsPagesLocalizedRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<IEnumerable<ProductsPagesLocalized>> GetByProductsPagesIdAsync(
        int productsPagesId
    )
    {
        return await _dbSet
            .Where(x => x.ProductsPagesId == productsPagesId && x.IsActive)
            .OrderBy(x => x.LanguageId)
            .ToListAsync();
    }

    public async Task<ProductsPagesLocalized?> GetByProductsPagesIdAndLanguageIdAsync(
        int productsPagesId,
        int languageId
    )
    {
        return await _dbSet.FirstOrDefaultAsync(x =>
            x.ProductsPagesId == productsPagesId && x.LanguageId == languageId && x.IsActive
        );
    }
}
