using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public class CategoryRepository : Repository<Category, int>, ICategoryRepository
{
    public CategoryRepository(AsalaDbContext context)
        : base(context) { }
}
