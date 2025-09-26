using Asala.Core.Common.Models;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Posts.Models;

public class BasePost : BaseEntity<long>
{
    public int UserId { get; set; }
    public User User { get; set; } = null!;
    public string Description { get; set; } = string.Empty;
    public int NumberOfReactions { get; set; } = 0;
    public int NumberOfComments { get; set; } = 0;
    public int PostTypeId { get; set; }
    public PostType PostType { get; set; } = null!;
    public List<BasePostMedia> PostMedias { get; set; } = [];
    public List<PostComment> PostComments { get; set; } = [];
    public List<Comment> Comments { get; set; } = [];
    public List<Like> Likes { get; set; } = [];
    public List<BasePostLocalized> Localizations { get; set; } = [];

    public virtual Article? Article { get; set; }
    public virtual Reel? Reel { get; set; }
}

public class BasePostLocalized : BaseEntity<long>
{
    public long PostId { get; set; }
    public int LanguageId { get; set; }
    public string Description { get; set; } = string.Empty;
    public BasePost Post { get; set; } = null!;
    public Language Language { get; set; } = null!;
}

public class BasePostMedia : BaseEntity<long>
{
    public long PostId { get; set; }
    public BasePost BasePost { get; set; } = null!;
    public string Url { get; set; } = string.Empty;
    public MediaType MediaType { get; set; } = MediaType.Other;
    public int DisplayOrder { get; set; } = 0;
}

