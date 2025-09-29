using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Products.Models;

public class ProductAttributeValueLocalized : BaseEntity<int>
{
    public int ProductAttributeValueId { get; set; }
    public ProductAttributeValue ProductAttributeValue { get; set; } = null!;
    
    public int LanguageId { get; set; }
    public Language Language { get; set; } = null!;
    
    public string Value { get; set; } = null!;
}
