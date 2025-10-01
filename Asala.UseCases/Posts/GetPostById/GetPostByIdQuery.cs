using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Posts.GetPostById;

public class GetPostByIdQuery : IRequest<Result<CompletePostDto?>>
{
    /// <summary>
    /// Post ID to retrieve
    /// </summary>
    public long Id { get; set; }

    /// <summary>
    /// Language code for localized content (default: "en")
    /// </summary>
    public string LanguageCode { get; set; } = "en";

    /// <summary>
    /// Include inactive posts in search (default: false)
    /// </summary>
    public bool IncludeInactive { get; set; } = false;
}

public class CompletePostDto
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int NumberOfReactions { get; set; }
    public int NumberOfComments { get; set; }
    public int PostTypeId { get; set; }
    public string PostTypeName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<PostMediaDto> PostMedias { get; set; } = [];
    public List<PostLocalizationDto> Localizations { get; set; } = [];
    
    // Post type specific data
    public ReelDto? Reel { get; set; }
    public ArticleDto? Article { get; set; }
    public NormalPostDto? NormalPost { get; set; }
}

public class PostMediaDto
{
    public long Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public int MediaType { get; set; }
    public int DisplayOrder { get; set; }
}

public class PostLocalizationDto
{
    public long Id { get; set; }
    public int LanguageId { get; set; }
    public string Description { get; set; } = string.Empty;
    public string LanguageName { get; set; } = string.Empty;
    public string LanguageCode { get; set; } = string.Empty;
}

public class ReelDto
{
    public long PostId { get; set; }
    public DateTime ExpirationDate { get; set; }
}

public class ArticleDto
{
    public long PostId { get; set; }
}

public class NormalPostDto
{
    public long PostId { get; set; }
}
