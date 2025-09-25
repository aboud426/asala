using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Comments;

public class CreateCommentCommand : IRequest<Result<CommentDto>>
{
    public int UserId { get; set; }
    public long BasePostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public long? ParentId { get; set; }
}

public class CommentDto
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public long BasePostId { get; set; }
    public string Content { get; set; } = string.Empty;
    public long? ParentId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
