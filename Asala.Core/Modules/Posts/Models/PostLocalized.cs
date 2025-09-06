using Asala.Core.Common.Models;

namespace Asala.Core.Modules.Posts.Models;

public class PostLocalized : BaseEntity<int>
{
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public int PostId { get; set; }
}
