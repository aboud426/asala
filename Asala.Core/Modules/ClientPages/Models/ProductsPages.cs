using Asala.Core.Common.Models;

namespace Asala.Core.Modules.ClientPages.Models;

public class ProductsPages : BaseEntity<int>
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;

    public virtual ICollection<ProductsPagesLocalized> Localizations { get; set; } =
        new List<ProductsPagesLocalized>();
}
