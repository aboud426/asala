using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public class ProductsPostRepository : Repository<ProductsPost, int>, IProductsPostRepository
{
    public ProductsPostRepository(AsalaDbContext context) : base(context)
    {
    }
}
