using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.Categories.Db;

public class ProductCategoryLocalizedRepository : Repository<ProductCategoryLocalized, int>, IProductCategoryLocalizedRepository
{
    public ProductCategoryLocalizedRepository(AsalaDbContext context)
        : base(context) { }
}
