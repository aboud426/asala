using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Posts.Models;

public class Post : BaseEntity<int>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Description { get; set; } = null!;
    public int NumberOfReactions { get; set; } = 0;
    public int NumberOfComments { get; set; } = 0;
    public List<PostLocalized> PostLocalizeds { get; set; } = [];
    public List<PostMedia> PostMedias { get; set; } = [];
    public int PostTypeId { get; set; }
    public PostType PostType { get; set; } = null!;
}
