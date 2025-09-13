using Asala.Core.Common.Models;

namespace Asala.Core.Modules.ClientPages.Models;

public class PostsPages : BaseEntity<int>
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;

    public virtual ICollection<PostsPagesLocalized> Localizations { get; set; } =
        new List<PostsPagesLocalized>();
}
