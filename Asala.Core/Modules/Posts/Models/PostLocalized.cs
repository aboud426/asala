using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;

namespace Asala.Core.Modules.Posts.Models;

public class PostLocalized : BaseEntity<int>
{
    public string DescriptionLocalized { get; set; } = null!;
    public int LanguageId { get; set; }
    public int PostId { get; set; }
    public Post Post { get; set; } = null!;
    public Language Language { get; set; } = null!;
}
