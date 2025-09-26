using Asala.Api.Controllers;
using Asala.UseCases.Posts.CreateReel;
using Asala.UseCases.Posts.GetReels;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Reel management controller for handling reel operations
/// </summary>
[ApiController]
[Route("api/reels")]
public class ReelController : BaseController
{
    private readonly ISender _mediator;

    public ReelController(ISender mediator)
        : base()
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of reels with full data
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10, max: 100)</param>
    /// <param name="activeOnly">Filter by active reels only (null for all, true for active, false for inactive)</param>
    /// <param name="userId">Filter by user ID</param>
    /// <param name="description">Filter by description text</param>
    /// <param name="createdAfter">Filter by creation date after this date</param>
    /// <param name="createdBefore">Filter by creation date before this date</param>
    /// <param name="minReactions">Minimum number of reactions</param>
    /// <param name="maxReactions">Maximum number of reactions</param>
    /// <param name="includeExpired">Include expired reels (default: true)</param>
    /// <param name="expiresAfter">Filter reels that expire after this date</param>
    /// <param name="expiresBefore">Filter reels that expire before this date</param>
    /// <param name="sortBy">Sort by field (CreatedAt, UpdatedAt, NumberOfReactions, ExpirationDate)</param>
    /// <param name="sortOrder">Sort order (asc, desc)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of reels with full BasePost data</returns>
    /// <response code="200">Reels retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        [FromQuery] int? userId = null,
        [FromQuery] string? description = null,
        [FromQuery] DateTime? createdAfter = null,
        [FromQuery] DateTime? createdBefore = null,
        [FromQuery] int? minReactions = null,
        [FromQuery] int? maxReactions = null,
        [FromQuery] bool? includeExpired = true,
        [FromQuery] DateTime? expiresAfter = null,
        [FromQuery] DateTime? expiresBefore = null,
        [FromQuery] string? sortBy = "CreatedAt",
        [FromQuery] string? sortOrder = "desc",
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetReelsQuery
        {
            Page = page,
            PageSize = pageSize,
            IsActive = activeOnly,
            UserId = userId,
            Description = description,
            CreatedAfter = createdAfter,
            CreatedBefore = createdBefore,
            MinReactions = minReactions,
            MaxReactions = maxReactions,
            IncludeExpired = includeExpired,
            ExpiresAfter = expiresAfter,
            ExpiresBefore = expiresBefore,
            SortBy = sortBy,
            SortOrder = sortOrder,
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get a reel by ID
    /// </summary>
    /// <param name="id">The ID of the reel to retrieve</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Reel data with full BasePost information</returns>
    /// <response code="200">Reel retrieved successfully</response>
    /// <response code="404">Reel not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(long id, CancellationToken cancellationToken = default)
    {
        var query = new GetReelByIdQuery { Id = id };
        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new reel with automatic expiration (24 hours from creation)
    /// </summary>
    /// <param name="command">Reel creation command</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created reel data with automatically calculated expiration date</returns>
    /// <response code="201">Reel created successfully with expiration date set to CreatedAt + 24 hours</response>
    /// <response code="400">Invalid input data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("create")]
    public async Task<IActionResult> CreateReel(
        CreateReelCommand command,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _mediator.Send(command, cancellationToken);
        return CreateResponse(result);
    }
}
