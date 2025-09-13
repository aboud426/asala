using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Models;

namespace Asala.Core.Modules.ClientPages.Models;

public class ProductsPages : BaseEntity<int>
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public virtual ICollection<ProductsPagesLocalized> Localizations { get; set; } = [];
    public virtual ICollection<IncludedProductType> IncludedProductTypes { get; set; } = [];
}

public class IncludedProductType : BaseEntity<int>
{
    public int ProductsPagesId { get; set; }
    public int ProductCategoryId { get; set; }
    public ProductCategory ProductCategory { get; set; } = null!;
    public ProductsPages ProductsPages { get; set; } = null!;
}
