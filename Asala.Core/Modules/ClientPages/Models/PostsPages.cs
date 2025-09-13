using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.ClientPages.Models;

public class PostsPages : BaseEntity<int>
{
    public string Key { get; set; } = null!;
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;

    public virtual ICollection<PostsPagesLocalized> Localizations { get; set; } = [];
    public virtual ICollection<IncludedPostType> IncludedPostTypes { get; set; } = [];
}

public class IncludedPostType : BaseEntity<int>
{
    public int PostsPagesId { get; set; }
    public int PostTypeId { get; set; }
    public PostType PostType { get; set; } = null!;
    public PostsPages PostsPages { get; set; } = null!;
}
