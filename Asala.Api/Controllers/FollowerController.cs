using System.Security.Claims;
using Asala.UseCases.Users.FollowUser;
using Asala.UseCases.Users.UnfollowUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Follower management controller for handling follow/unfollow operations
/// </summary>
[ApiController]
[Route("api/followers")]
[Authorize]
public class FollowerController : BaseController
{
    private readonly IMediator _mediator;

    public FollowerController(IMediator mediator) : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Follow a user
    /// </summary>
    /// <param name="followingId">ID of the user to follow</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Follow relationship details</returns>
    /// <response code="200">User followed successfully</response>
    /// <response code="400">Invalid request or already following</response>
    /// <response code="401">Unauthorized - token required</response>
    /// <response code="404">User not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("follow/{followingId}")]
    public async Task<IActionResult> FollowUser(
        int followingId,
        CancellationToken cancellationToken = default
    )
    {
        // Get follower ID from JWT token
        var followerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(followerIdClaim) || !int.TryParse(followerIdClaim, out int followerId))
        {
            return Unauthorized("Invalid token - user ID not found");
        }

        var command = new FollowUserCommand
        {
            FollowerId = followerId,
            FollowingId = followingId
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Unfollow a user
    /// </summary>
    /// <param name="followingId">ID of the user to unfollow</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">User unfollowed successfully</response>
    /// <response code="400">Invalid request or not following</response>
    /// <response code="401">Unauthorized - token required</response>
    /// <response code="404">Follow relationship not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("unfollow/{followingId}")]
    public async Task<IActionResult> UnfollowUser(
        int followingId,
        CancellationToken cancellationToken = default
    )
    {
        // Get follower ID from JWT token
        var followerIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(followerIdClaim) || !int.TryParse(followerIdClaim, out int followerId))
        {
            return Unauthorized("Invalid token - user ID not found");
        }

        var command = new UnfollowUserCommand
        {
            FollowerId = followerId,
            FollowingId = followingId
        };

        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }
}
