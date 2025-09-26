using Asala.Core.Common.Models;
using Asala.UseCases.Posts.CreateReel;
using MediatR;

namespace Asala.UseCases.Posts.GetReels;

public class GetReelsQuery : IRequest<Result<PaginatedResult<ReelDto>>>
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public bool? IsActive { get; set; }
    public int? UserId { get; set; }
    public string? Description { get; set; }
    public DateTime? CreatedAfter { get; set; }
    public DateTime? CreatedBefore { get; set; }
    public int? MinReactions { get; set; }
    public int? MaxReactions { get; set; }
    public string? LanguageCode { get; set; }
    public bool IncludeDeleted { get; set; } = false;
    public bool? IncludeExpired { get; set; } = true; // Include expired reels by default
    public DateTime? ExpiresAfter { get; set; } // Filter reels that expire after this date
    public DateTime? ExpiresBefore { get; set; } // Filter reels that expire before this date
    public string? SortBy { get; set; } = "CreatedAt"; // CreatedAt, UpdatedAt, NumberOfReactions, ExpirationDate
    public string? SortOrder { get; set; } = "desc"; // asc, desc
}
