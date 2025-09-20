using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Posts.Models;

public class PostType : BaseEntity<int>
{
    public string Name { get; set; } = null!;
    public string Description { get; set; } = null!;
    public List<PostTypeLocalized> PostTypeLocalizations { get; set; } = [];
}
