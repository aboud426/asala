namespace Asala.Core.Modules.Posts.Models;

public class NormalPost
{
    public long PostId { get; set; }
    public BasePost BasePost { get; set; } = null!;
}
