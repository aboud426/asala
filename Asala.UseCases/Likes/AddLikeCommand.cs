using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Likes;

public class AddLikeCommand : IRequest<Result<LikeDto>>
{
    public int UserId { get; set; }
    public long BasePostId { get; set; }
}

public class LikeDto
{
    public long Id { get; set; }
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public long BasePostId { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
