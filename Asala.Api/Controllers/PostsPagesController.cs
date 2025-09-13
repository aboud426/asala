using Asala.Core.Modules.ClientPages.DTOs;
using Asala.UseCases.ClientPages;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Controller for managing posts pages configuration
/// </summary>
[ApiController]
[Route("api/posts-pages")]
public class PostsPagesController : BaseController
{
    private readonly IPostsPagesService _postsPagesService;

    public PostsPagesController(IPostsPagesService postsPagesService)
        : base()
    {
        _postsPagesService =
            postsPagesService ?? throw new ArgumentNullException(nameof(postsPagesService));
    }

    /// <summary>
    /// Get paginated list of posts pages
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10, max: 100)</param>
    /// <param name="activeOnly">Filter by active posts pages only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of posts pages</returns>
    /// <response code="200">Posts pages retrieved successfully</response>
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
        var result = await _postsPagesService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get posts pages details by ID
    /// </summary>
    /// <param name="id">The posts pages ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Posts pages details including localizations and included post types</returns>
    /// <response code="200">Posts pages found</response>
    /// <response code="404">Posts pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _postsPagesService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get posts pages details by key
    /// </summary>
    /// <param name="key">The posts pages key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Posts pages details including localizations and included post types</returns>
    /// <response code="200">Posts pages found</response>
    /// <response code="404">Posts pages not found</response>
    /// <response code="400">Invalid key</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("by-key/{key}")]
    public async Task<IActionResult> GetByKey(
        string key,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postsPagesService.GetByKeyAsync(key, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new posts pages
    /// </summary>
    /// <param name="createDto">Posts pages creation data including localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created posts pages details</returns>
    /// <response code="200">Posts pages created successfully</response>
    /// <response code="400">Invalid input data or key already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePostsPagesDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postsPagesService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing posts pages
    /// </summary>
    /// <param name="id">The posts pages ID</param>
    /// <param name="updateDto">Posts pages update data including localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated posts pages details</returns>
    /// <response code="200">Posts pages updated successfully</response>
    /// <response code="400">Invalid input data or key already exists</response>
    /// <response code="404">Posts pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdatePostsPagesDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postsPagesService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a posts pages (soft delete)
    /// </summary>
    /// <param name="id">The posts pages ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success result</returns>
    /// <response code="200">Posts pages deleted successfully</response>
    /// <response code="404">Posts pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _postsPagesService.DeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle activation status of a posts pages
    /// </summary>
    /// <param name="id">The posts pages ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success result</returns>
    /// <response code="200">Posts pages activation toggled successfully</response>
    /// <response code="404">Posts pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPatch("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postsPagesService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get posts pages dropdown list for selection
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of posts pages for dropdown selection</returns>
    /// <response code="200">Dropdown list retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _postsPagesService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update included post types for a posts pages
    /// </summary>
    /// <param name="id">The posts pages ID</param>
    /// <param name="postTypeIds">List of post type IDs to include</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success result</returns>
    /// <response code="200">Included post types updated successfully</response>
    /// <response code="404">Posts pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/included-post-types")]
    public async Task<IActionResult> UpdateIncludedPostTypes(
        int id,
        [FromBody] IEnumerable<int> postTypeIds,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postsPagesService.UpdateIncludedPostTypesAsync(
            id,
            postTypeIds,
            cancellationToken
        );
        return CreateResponse(result);
    }
}