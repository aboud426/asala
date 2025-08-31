using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Categories.Models;

public class CategoryLocalized : BaseEntity<int>
{
    public int CategoryId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
}
