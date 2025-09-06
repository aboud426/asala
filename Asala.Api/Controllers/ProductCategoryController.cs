using Asala.Core.Modules.Categories.DTOs;
using Asala.UseCases.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Product category management controller for organizing products with localization support
/// </summary>
[ApiController]
[Route("api/product-categories")]
public class ProductCategoryController : BaseController
{
    private readonly IProductCategoryService _productCategoryService;

    public ProductCategoryController(IProductCategoryService productCategoryService)
        : base()
    {
        _productCategoryService = productCategoryService;
    }

    /// <summary>
    /// Get paginated list of product categories
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 5)</param>
    /// <param name="activeOnly">Filter by active categories only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of product categories with localization support</returns>
    /// <response code="200">Product categories retrieved successfully</response>
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
        var result = await _productCategoryService.GetPaginatedAsync(
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
        var result = await _productCategoryService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get product categories formatted for dropdown selection
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of product categories suitable for dropdown/select controls</returns>
    /// <response code="200">Dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _productCategoryService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new product category with localization support
    /// </summary>
    /// <param name="createDto">Product category creation data including name, description, and localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created product category details</returns>
    /// <response code="200">Product category created successfully</response>
    /// <response code="400">Invalid product category data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductCategoryDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productCategoryService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing product category
    /// </summary>
    /// <param name="id">Product category ID to update</param>
    /// <param name="updateDto">Updated product category data including localized content</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated product category details</returns>
    /// <response code="200">Product category updated successfully</response>
    /// <response code="400">Invalid product category data</response>
    /// <response code="404">Product category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateProductCategoryDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productCategoryService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle product category activation status (active/inactive)
    /// </summary>
    /// <param name="id">Product category ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Product category activation toggled successfully</response>
    /// <response code="404">Product category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productCategoryService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a product category (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Product category ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Product category deleted successfully</response>
    /// <response code="404">Product category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productCategoryService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    [HttpGet("missing-translations")]
    public async Task<IActionResult> GetProductCategoriesMissingTranslations(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productCategoryService.GetProductCategoriesMissingTranslationsAsync(
            cancellationToken
        );
        return CreateResponse(result);
    }

    [HttpGet("tree")]
    public async Task<IActionResult> GetProductCategoryTree(
        [FromQuery] int? rootId = null,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productCategoryService.GetProductCategoryTreeAsync(
            rootId,
            languageCode,
            cancellationToken
        );
        return CreateResponse(result);
    }
}
