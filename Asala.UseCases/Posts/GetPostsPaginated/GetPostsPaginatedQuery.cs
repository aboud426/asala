using Asala.Core.Common.Models;
using Asala.UseCases.Posts.CreateBasePost;
using MediatR;

namespace Asala.UseCases.Posts.GetPostsPaginated;

public class GetPostsPaginatedQuery : IRequest<Result<PaginatedResult<BasePostDto>>>
{
    /// <summary>
    /// Page number (starts from 1)
    /// </summary>
    public int Page { get; set; } = 1;

    /// <summary>
    /// Number of items per page (max 100)
    /// </summary>
    public int PageSize { get; set; } = 10;

    /// <summary>
    /// Post type filter: "reel", "normal", "article", or null for all types
    /// </summary>
    public string? Type { get; set; }

    /// <summary>
    /// Specific post type ID for filtering
    /// </summary>
    public int? PostTypeId { get; set; }

    /// <summary>
    /// Language code for localized content (default: "en")
    /// </summary>
    public string LanguageCode { get; set; } = "en";

    /// <summary>
    /// Filter by active posts only (default: true)
    /// </summary>
    public bool? ActiveOnly { get; set; } = true;
}

public enum PostTypeEnum
{
    Reel,
    Normal,
    Article
}
