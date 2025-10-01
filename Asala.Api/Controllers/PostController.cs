using Asala.Core.Modules.Posts.DTOs;
using Asala.UseCases.Posts;
using Asala.UseCases.Posts.GetPostsPaginated;
using Asala.UseCases.Posts.GetPostById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Post management controller for handling posts with localization support
/// </summary>
[ApiController]
[Route("api/posts")]
public class PostController : BaseController
{
    private readonly IPostService _postService;
    private readonly IMediator _mediator;

    public PostController(IPostService postService, IMediator mediator)
        : base()
    {
        _postService = postService;
        _mediator = mediator;
    }

    /// <summary>
    /// Get paginated list of posts
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active posts only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of posts with localization support</returns>
    /// <response code="200">Posts retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get complete post information by ID with localization support
    /// Returns all post data including type-specific information (Reel, Article, NormalPost)
    /// </summary>
    /// <param name="id">Post ID</param>
    /// <param name="languageCode">Language code for localized content (default: "en")</param>
    /// <param name="includeInactive">Include inactive posts in search (default: false)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Complete post details with localized content and type-specific data</returns>
    /// <response code="200">Post retrieved successfully with complete information</response>
    /// <response code="404">Post not found</response>
    /// <response code="400">Invalid post ID or language not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        long id, 
        [FromQuery] string languageCode = "en",
        [FromQuery] bool includeInactive = false,
        CancellationToken cancellationToken = default)
    {
        var query = new GetPostByIdQuery
        {
            Id = id,
            LanguageCode = languageCode,
            IncludeInactive = includeInactive
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get a post by ID (legacy endpoint - uses PostService)
    /// </summary>
    /// <param name="id">Post ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Post details with localizations</returns>
    /// <response code="200">Post retrieved successfully</response>
    /// <response code="404">Post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("legacy/{id}")]
    public async Task<IActionResult> GetByIdLegacy(int id, CancellationToken cancellationToken = default)
    {
        var result = await _postService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    // /// <summary>
    // /// Create a new post with localization support
    // /// </summary>
    // /// <param name="createDto">Post creation data including description, user ID, post type, and localized versions</param>
    // /// <param name="cancellationToken">Cancellation token</param>
    // /// <returns>Created post details</returns>
    // /// <response code="200">Post created successfully</response>
    // /// <response code="400">Invalid post data</response>
    // /// <response code="500">Internal server error</response>
    // [HttpPost]
    // public async Task<IActionResult> Create(
    //     [FromBody] CreatePostDto createDto,
    //     CancellationToken cancellationToken = default
    // )
    // {
    //     var result = await _postService.CreateAsync(createDto, cancellationToken);
    //     return CreateResponse(result);
    // }

    /// <summary>
    /// Update an existing post
    /// </summary>
    /// <param name="id">Post ID to update</param>
    /// <param name="updateDto">Updated post data including localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated post details</returns>
    /// <response code="200">Post updated successfully</response>
    /// <response code="400">Invalid post data</response>
    /// <response code="404">Post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdatePostDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get paginated list of posts with localized descriptions
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="languageCode">Language code for localization (default: "en")</param>
    /// <param name="activeOnly">Filter by active posts only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of posts with localized descriptions</returns>
    /// <response code="200">Posts retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("localized")]
    public async Task<IActionResult> GetPaginatedLocalized(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string languageCode = "en",
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postService.GetPaginatedLocalizedAsync(
            page,
            pageSize,
            languageCode,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new post with media support
    /// </summary>
    /// <param name="createDto">Post creation data with media URLs</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created post details</returns>
    /// <response code="200">Post created successfully</response>
    /// <response code="400">Invalid post data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost("create")]
    public async Task<IActionResult> CreateWithMedia(
        [FromBody] CreatePostWithMediaDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postService.CreateWithMediaAsync(
            createDto,
            createDto.ProviderId,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get posts by page ID with cursor-based pagination
    /// </summary>
    /// <param name="postsPagesId">Posts page ID</param>
    /// <param name="languageCode">Language code for localization (default: "en")</param>
    /// <param name="cursor">Cursor for pagination (null for first page)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Posts for the specified page with cursor pagination</returns>
    /// <response code="200">Posts retrieved successfully</response>
    /// <response code="404">Posts page not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("by-page/{postsPagesId}")]
    public async Task<IActionResult> GetPostsByPageWithCursor(
        [FromRoute] int postsPagesId,
    [FromQuery] string languageCode = "en",
        [FromQuery] int? cursor = null,
        [FromQuery] int pageSize = 10,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postService.GetPostsByPageWithCursorAsync(
            postsPagesId,
            languageCode,
            cursor,
            pageSize,
            true,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get paginated posts with type filtering
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10, max: 100)</param>
    /// <param name="type">Post type filter: "reel", "normal", "article", or null for all types</param>
    /// <param name="postTypeId">Specific post type ID for filtering</param>
    /// <param name="languageCode">Language code for localized content (default: "en")</param>
    /// <param name="activeOnly">Filter by active posts only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of posts with localized content</returns>
    /// <response code="200">Posts retrieved successfully</response>
    /// <response code="400">Invalid parameters</response>
    /// <response code="404">Language not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("paginated")]
    public async Task<IActionResult> GetPostsPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? type = null,
        [FromQuery] int? postTypeId = null,
        [FromQuery] string languageCode = "en",
        [FromQuery] bool? activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var query = new GetPostsPaginatedQuery
        {
            Page = page,
            PageSize = pageSize,
            Type = type,
            PostTypeId = postTypeId,
            LanguageCode = languageCode,
            ActiveOnly = activeOnly
        };

        var result = await _mediator.Send(query, cancellationToken);
        return CreateResponse(result);
    }
}
