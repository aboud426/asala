using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Posts.Models;

public class Comment : BaseEntity<long>
{
    public long BasePostId { get; set; }
    public BasePost BasePost { get; set; } = null!;
    
    public long? ParentId { get; set; }
    public Comment? Parent { get; set; }
    
    public string Content { get; set; } = string.Empty;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    
    // Navigation properties
    public List<Comment> Replies { get; set; } = [];
}
