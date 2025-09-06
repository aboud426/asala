using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Posts.Models;

public class PostMedia : BaseEntity<int>
{
    public int PostId { get; set; }
    public int MediaId { get; set; }
}
