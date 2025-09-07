using Asala.Core.Modules.Posts.DTOs;
using Asala.UseCases.Posts;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// PostType management controller for handling post types with localization support
/// </summary>
[ApiController]
[Route("api/post-types")]
public class PostTypeController : BaseController
{
    private readonly IPostTypeService _postTypeService;

    public PostTypeController(IPostTypeService postTypeService)
        : base()
    {
        _postTypeService = postTypeService;
    }

    /// <summary>
    /// Get paginated list of post types
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active post types only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of post types with localization support</returns>
    /// <response code="200">Post types retrieved successfully</response>
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
        var result = await _postTypeService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get a post type by ID
    /// </summary>
    /// <param name="id">Post type ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Post type details with localizations</returns>
    /// <response code="200">Post type retrieved successfully</response>
    /// <response code="404">Post type not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _postTypeService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get a post type by name
    /// </summary>
    /// <param name="name">Post type name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Post type details with localizations</returns>
    /// <response code="200">Post type retrieved successfully</response>
    /// <response code="404">Post type not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("by-name/{name}")]
    public async Task<IActionResult> GetByName(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeService.GetByNameAsync(name, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new post type with localization support
    /// </summary>
    /// <param name="createDto">Post type creation data including name, description, and localized versions</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created post type details</returns>
    /// <response code="200">Post type created successfully</response>
    /// <response code="400">Invalid post type data or post type name already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePostTypeDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing post type
    /// </summary>
    /// <param name="id">Post type ID to update</param>
    /// <param name="updateDto">Updated post type data including localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated post type details</returns>
    /// <response code="200">Post type updated successfully</response>
    /// <response code="400">Invalid post type data</response>
    /// <response code="404">Post type not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdatePostTypeDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle post type activation status (active/inactive)
    /// </summary>
    /// <param name="id">Post type ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Post type activation toggled successfully</response>
    /// <response code="404">Post type not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a post type (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Post type ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Post type deleted successfully</response>
    /// <response code="404">Post type not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get post types that are missing translations
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of post type IDs that are missing translations</returns>
    /// <response code="200">Post types missing translations retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("missing-translations")]
    public async Task<IActionResult> GetPostTypesMissingTranslations(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _postTypeService.GetPostTypesMissingTranslationsAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get post types for dropdown/select components (simplified data)
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of post types with basic information for dropdowns</returns>
    /// <response code="200">Post type dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _postTypeService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }
}
