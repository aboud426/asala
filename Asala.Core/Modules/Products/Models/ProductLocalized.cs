using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Products.Models;

public class ProductLocalized : BaseEntity<int>
{
    public int LanguageId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string? DescriptionLocalized { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
    public Language Language { get; set; } = null!;
}
