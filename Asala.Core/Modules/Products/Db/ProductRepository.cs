using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public class ProductRepository : Repository<Product, int>, IProductRepository
{
    public ProductRepository(AsalaDbContext context) : base(context)
    {
    }
}
