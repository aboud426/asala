using Asala.Core.Common.Models;

namespace Asala.Core.Modules.ClientPages.Models;

public class PostsPagesLocalized : BaseEntity<int>
{
    public int PostsPagesId { get; set; }
    public string NameLocalized { get; set; } = null!;
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }

    public virtual PostsPages PostsPages { get; set; } = null!;
}
