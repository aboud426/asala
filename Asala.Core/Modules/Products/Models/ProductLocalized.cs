using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Products.Models;

public class ProductLocalized : BaseEntity<int>
{
    public int LanguageId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string? DescriptionLocalized { get; set; }
    public int ProductId { get; set; }
}
