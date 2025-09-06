using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Posts.Models;

public class Post : BaseEntity<int>
{
    public int UserId { get; set; }
    public string? Description { get; set; }
    public int? NumberOfReactions { get; set; }
}
