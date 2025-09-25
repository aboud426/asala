using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Posts.Models;

public class Like : BaseEntity<long>
{
    public long BasePostId { get; set; }
    public BasePost BasePost { get; set; } = null!;
    
    public int UserId { get; set; }
    public User User { get; set; } = null!;
}
