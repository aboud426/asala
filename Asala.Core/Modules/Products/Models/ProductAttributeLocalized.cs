using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Products.Models;

public class ProductAttributeLocalized : BaseEntity<int>
{
    public int ProductAttributeId { get; set; }
    public ProductAttribute ProductAttribute { get; set; } = null!;
    
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    
    public string Name { get; set; } = null!;
}
