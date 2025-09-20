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
    public string? SortBy { get; set; } = "CreatedAt"; // CreatedAt, UpdatedAt, NumberOfReactions
    public string? SortOrder { get; set; } = "desc"; // asc, desc
}
