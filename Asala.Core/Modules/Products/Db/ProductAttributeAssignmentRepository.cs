using Asala.Core.Common.Abstractions;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Products.Models;

namespace Asala.Core.Modules.Products.Db;

public class ProductAttributeAssignmentRepository : Repository<ProductAttributeAssignment, int>, IProductAttributeAssignmentRepository
{
    public ProductAttributeAssignmentRepository(AsalaDbContext context) : base(context)
    {
    }
}
