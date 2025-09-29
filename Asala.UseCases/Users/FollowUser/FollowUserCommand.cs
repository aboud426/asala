using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;
using MediatR;

namespace Asala.UseCases.Users.FollowUser;

public class FollowUserCommand : IRequest<Result<FollowerDto>>
{
    public int FollowerId { get; set; }
    public int FollowingId { get; set; }
}
