using Asala.Core.Modules.ClientPages.DTOs;
using Asala.UseCases.ClientPages;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Controller for managing products pages configuration
/// </summary>
[ApiController]
[Route("api/products-pages")]
public class ProductsPagesController : BaseController
{
    private readonly IProductsPagesService _productsPagesService;

    public ProductsPagesController(IProductsPagesService productsPagesService)
        : base()
    {
        _productsPagesService =
            productsPagesService ?? throw new ArgumentNullException(nameof(productsPagesService));
    }

    /// <summary>
    /// Get paginated list of products pages
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10, max: 100)</param>
    /// <param name="activeOnly">Filter by active products pages only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of products pages</returns>
    /// <response code="200">Products pages retrieved successfully</response>
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
        var result = await _productsPagesService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get products pages details by ID
    /// </summary>
    /// <param name="id">The products pages ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Products pages details including localizations and included product categories</returns>
    /// <response code="200">Products pages found</response>
    /// <response code="404">Products pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _productsPagesService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get products pages details by key
    /// </summary>
    /// <param name="key">The products pages key</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Products pages details including localizations and included product categories</returns>
    /// <response code="200">Products pages found</response>
    /// <response code="404">Products pages not found</response>
    /// <response code="400">Invalid key</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("by-key/{key}")]
    public async Task<IActionResult> GetByKey(
        string key,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productsPagesService.GetByKeyAsync(key, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new products pages
    /// </summary>
    /// <param name="createDto">Products pages creation data including localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created products pages details</returns>
    /// <response code="200">Products pages created successfully</response>
    /// <response code="400">Invalid input data or key already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProductsPagesDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productsPagesService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing products pages
    /// </summary>
    /// <param name="id">The products pages ID</param>
    /// <param name="updateDto">Products pages update data including localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated products pages details</returns>
    /// <response code="200">Products pages updated successfully</response>
    /// <response code="400">Invalid input data or key already exists</response>
    /// <response code="404">Products pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateProductsPagesDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productsPagesService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a products pages (soft delete)
    /// </summary>
    /// <param name="id">The products pages ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success result</returns>
    /// <response code="200">Products pages deleted successfully</response>
    /// <response code="404">Products pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _productsPagesService.DeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle activation status of a products pages
    /// </summary>
    /// <param name="id">The products pages ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success result</returns>
    /// <response code="200">Products pages activation toggled successfully</response>
    /// <response code="404">Products pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPatch("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productsPagesService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get products pages dropdown list for selection
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of products pages for dropdown selection</returns>
    /// <response code="200">Dropdown list retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(CancellationToken cancellationToken = default)
    {
        var result = await _productsPagesService.GetDropdownAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update included product categories for a products pages
    /// </summary>
    /// <param name="id">The products pages ID</param>
    /// <param name="productCategoryIds">List of product category IDs to include</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success result</returns>
    /// <response code="200">Included product categories updated successfully</response>
    /// <response code="404">Products pages not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/included-product-categories")]
    public async Task<IActionResult> UpdateIncludedProductCategories(
        int id,
        [FromBody] IEnumerable<int> productCategoryIds,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _productsPagesService.UpdateIncludedProductCategoriesAsync(
            id,
            productCategoryIds,
            cancellationToken
        );
        return CreateResponse(result);
    }
}
