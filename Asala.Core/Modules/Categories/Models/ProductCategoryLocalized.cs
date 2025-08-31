using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Categories.Models;

public class ProductCategoryLocalized : BaseEntity<int>
{
    public int CategoryId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string? DecriptionLocalized { get; set; }
    public int LanguageId { get; set; }
    
}
