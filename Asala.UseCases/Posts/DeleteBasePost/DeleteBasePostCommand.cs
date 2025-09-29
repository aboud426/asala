using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Posts.DeleteBasePost;

public class DeleteBasePostCommand : IRequest<Result>
{
    public long PostId { get; set; }
}
