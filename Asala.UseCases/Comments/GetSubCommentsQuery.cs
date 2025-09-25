using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Comments;

public class GetSubCommentsQuery : IRequest<Result<SubCommentsResponseDto>>
{
    public long ParentCommentId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10; // Smaller page size for replies
    public string SortOrder { get; set; } = "asc"; // asc = oldest first, desc = newest first
}

public class SubCommentsResponseDto
{
    public long ParentCommentId { get; set; }
    public int TotalReplies { get; set; }
    public int CurrentPage { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
    public bool HasNextPage { get; set; }
    public bool HasPreviousPage { get; set; }
    public List<CommentDto> Replies { get; set; } = [];
}
