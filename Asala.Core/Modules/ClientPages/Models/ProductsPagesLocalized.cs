using Asala.Core.Common.Models;

namespace Asala.Core.Modules.ClientPages.Models;

public class ProductsPagesLocalized : BaseEntity<int>
{
    public int ProductsPagesId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }

    public virtual ProductsPages ProductsPages { get; set; } = null!;
}
