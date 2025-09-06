using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public class ProductLocalizedRepository : Repository<ProductLocalized, int>, IProductLocalizedRepository
{
    public ProductLocalizedRepository(AsalaDbContext context) : base(context)
    {
    }
}
