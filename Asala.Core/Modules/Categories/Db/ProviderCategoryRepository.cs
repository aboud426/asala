using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public class ProviderCategoryRepository : Repository<ProviderCategory, int>, IProviderCategoryRepository
{
    public ProviderCategoryRepository(AsalaDbContext context)
        : base(context) { }
}
