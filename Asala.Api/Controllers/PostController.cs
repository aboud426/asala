using Asala.Core.Modules.Posts.DTOs;
using Asala.UseCases.Posts;
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

    public PostController(IPostService postService)
        : base()
    {
        _postService = postService;
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
    /// Get a post by ID
    /// </summary>
    /// <param name="id">Post ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Post details with localizations</returns>
    /// <response code="200">Post retrieved successfully</response>
    /// <response code="404">Post not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
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
}
