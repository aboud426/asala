namespace Asala.Core.Modules.Posts.Models;

public class Reel
{
    public long PostId { get; set; }
    public BasePost BasePost { get; set; } = null!;
    public DateTime ExpirationDate { get; set; }
}
