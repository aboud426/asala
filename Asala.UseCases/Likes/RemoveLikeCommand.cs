using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Likes;

public class RemoveLikeCommand : IRequest<Result<RemoveLikeDto>>
{
    public int UserId { get; set; }
    public long BasePostId { get; set; }
}

public class RemoveLikeDto
{
    public bool WasRemoved { get; set; }
    public string Message { get; set; } = string.Empty;
}
