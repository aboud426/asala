using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Comments;

public class GetCommentsQuery : IRequest<Result<List<CommentDto>>>
{
    public long BasePostId { get; set; }
    public long? ParentId { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
    public string SortOrder { get; set; } = "asc"; // asc = oldest first, desc = newest first
}
