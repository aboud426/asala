using Asala.Core.Modules.Categories.DTOs;
using Asala.UseCases.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Category management controller for handling hierarchical categories with localization support
/// </summary>
[ApiController]
[Route("api/categories")]
public class CategoryController : BaseController
{
    private readonly ICategoryService _categoryService;

    public CategoryController(ICategoryService categoryService)
        : base()
    {
        _categoryService = categoryService;
    }

    /// <summary>
    /// Get paginated list of categories
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 5)</param>
    /// <param name="activeOnly">Filter by active categories only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of categories with localization support</returns>
    /// <response code="200">Categories retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _categoryService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get categories formatted for dropdown selection
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of categories suitable for dropdown/select controls</returns>
    /// <response code="200">Dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _categoryService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new category with localization support
    /// </summary>
    /// <param name="createDto">Category creation data including name, description, and localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created category details</returns>
    /// <response code="200">Category created successfully</response>
    /// <response code="400">Invalid category data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateCategoryDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing category
    /// </summary>
    /// <param name="id">Category ID to update</param>
    /// <param name="updateDto">Updated category data including localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated category details</returns>
    /// <response code="200">Category updated successfully</response>
    /// <response code="400">Invalid category data</response>
    /// <response code="404">Category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateCategoryDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle category activation status (active/inactive)
    /// </summary>
    /// <param name="id">Category ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Category activation toggled successfully</response>
    /// <response code="404">Category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a category (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Category ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Category deleted successfully</response>
    /// <response code="404">Category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get direct subcategories of a parent category
    /// </summary>
    /// <param name="parentId">Parent category ID</param>
    /// <param name="languageCode">Language code for localized content (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of subcategories with localized content</returns>
    /// <response code="200">Subcategories retrieved successfully</response>
    /// <response code="404">Parent category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{parentId}/subcategories")]
    public async Task<IActionResult> GetSubcategories(
        int parentId,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.GetSubcategoriesAsync(
            parentId,
            languageCode,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get hierarchical tree structure of categories
    /// </summary>
    /// <param name="rootId">Root category ID to start the tree from (optional, null for all root categories)</param>
    /// <param name="languageCode">Language code for localized content (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Hierarchical tree structure of categories with parent-child relationships</returns>
    /// <response code="200">Category tree retrieved successfully</response>
    /// <response code="404">Root category not found (when rootId is specified)</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("tree")]
    public async Task<IActionResult> GetCategoryTree(
        [FromQuery] int? rootId = null,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.GetCategoryTreeAsync(
            rootId,
            languageCode,
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("missing-translations")]
    public async Task<IActionResult> GetCategoriesMissingTranslations(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _categoryService.GetCategoriesMissingTranslationsAsync(
            cancellationToken
        );
        return CreateResponse(result);
    }
}
