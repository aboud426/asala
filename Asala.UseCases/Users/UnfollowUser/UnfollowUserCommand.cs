using Asala.Core.Common.Models;
using MediatR;

namespace Asala.UseCases.Users.UnfollowUser;

public class UnfollowUserCommand : IRequest<Result>
{
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
}
