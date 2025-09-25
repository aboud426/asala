using Asala.UseCases.Likes;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Like management controller for handling like operations on base posts
/// </summary>
[ApiController]
[Route("api/likes")]
public class LikeController : BaseController
{
    private readonly IMediator _mediator;

    public LikeController(IMediator mediator) : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Add a like to a base post
    /// </summary>
    /// <param name="command">Like data including user ID and base post ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created like with user information</returns>
    /// <response code="200">Like added successfully (or existing like returned)</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">User or base post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> AddLike(
        [FromBody] AddLikeCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Remove a like from a base post (dislike)
    /// </summary>
    /// <param name="command">Remove like data including user ID and base post ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Result indicating whether the like was removed</returns>
    /// <response code="200">Like removal processed successfully (may or may not have been removed)</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">User or base post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete]
    public async Task<IActionResult> RemoveLike(
        [FromBody] RemoveLikeCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }
}
