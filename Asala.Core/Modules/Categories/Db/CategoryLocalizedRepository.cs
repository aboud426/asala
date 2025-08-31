using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public class CategoryLocalizedRepository : Repository<CategoryLocalized, int>, ICategoryLocalizedRepository
{
    public CategoryLocalizedRepository(AsalaDbContext context)
        : base(context) { }
}
