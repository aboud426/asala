using Asala.UseCases.Comments;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Comment management controller for handling comment operations
/// </summary>
[ApiController]
[Route("api/comments")]
public class CommentController : BaseController
{
    private readonly IMediator _mediator;

    public CommentController(IMediator mediator) : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Create a new comment on a base post
    /// </summary>
    /// <param name="command">Comment creation data including user ID, base post ID, content, and optional parent ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created comment with user information</returns>
    /// <response code="200">Comment created successfully</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">User or base post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> CreateComment(
        [FromBody] CreateCommentCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get comments for a base post with optional parent filtering
    /// </summary>
    /// <param name="basePostId">Base post ID to get comments for</param>
    /// <param name="parentId">Optional parent comment ID - null for top-level comments, specific ID for replies</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 20, max: 100)</param>
    /// <param name="sortOrder">Sort order: 'asc' for oldest first, 'desc' for newest first (default: 'asc')</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of comments with user information</returns>
    /// <response code="200">Comments retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="404">Base post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("by-post/{basePostId}")]
    public async Task<IActionResult> GetComments(
        [FromRoute] long basePostId,
        [FromQuery] long? parentId = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sortOrder = "asc",
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetCommentsQuery
        {
            BasePostId = basePostId,
            ParentId = parentId,
            Page = page,
            PageSize = pageSize,
            SortOrder = sortOrder
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get subcomments (replies) for a specific parent comment
    /// </summary>
    /// <param name="parentCommentId">The parent comment ID to get replies for</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="sortOrder">Sort order: asc (oldest first) or desc (newest first)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of subcomments with metadata</returns>
    /// <response code="200">Subcomments retrieved successfully</response>
    /// <response code="400">Invalid input data or validation error</response>
    /// <response code="404">Parent comment not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("subcomments/{parentCommentId}")]
    public async Task<IActionResult> GetSubComments(
        [FromRoute] long parentCommentId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string sortOrder = "asc",
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetSubCommentsQuery
        {
            ParentCommentId = parentCommentId,
            Page = page,
            PageSize = pageSize,
            SortOrder = sortOrder
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }
}
