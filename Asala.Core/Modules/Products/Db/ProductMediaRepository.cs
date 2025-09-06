using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public class ProductMediaRepository : Repository<ProductMedia, int>, IProductMediaRepository
{
    public ProductMediaRepository(AsalaDbContext context) : base(context)
    {
    }
}
