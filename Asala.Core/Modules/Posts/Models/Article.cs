using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Posts.Models;

public class Article
{
    public long PostId { get; set; }
    public BasePost BasePost { get; set; } = null!;
}
