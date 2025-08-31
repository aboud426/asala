using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public class ProductCategoryRepository : Repository<ProductCategory, int>, IProductCategoryRepository
{
    public ProductCategoryRepository(AsalaDbContext context)
        : base(context) { }
}
