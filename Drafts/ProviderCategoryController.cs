using Asala.Core.Modules.Categories.DTOs;
using Asala.UseCases.Categories;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Provider category management controller for organizing service providers by category
/// </summary>
[ApiController]
[Route("api/provider-categories")]
public class ProviderCategoryController : BaseController
{
    private readonly IProviderCategoryService _providerCategoryService;

    public ProviderCategoryController(IProviderCategoryService providerCategoryService)
        : base()
    {
        _providerCategoryService = providerCategoryService;
    }

    /// <summary>
    /// Get paginated list of provider categories
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 5)</param>
    /// <param name="activeOnly">Filter by active categories only (null for all, true for active, false for inactive)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of provider categories</returns>
    /// <response code="200">Provider categories retrieved successfully</response>
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
        var result = await _providerCategoryService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new provider category
    /// </summary>
    /// <param name="createDto">Provider category creation data including name and description</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created provider category details</returns>
    /// <response code="200">Provider category created successfully</response>
    /// <response code="400">Invalid provider category data</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateProviderCategoryDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerCategoryService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing provider category
    /// </summary>
    /// <param name="id">Provider category ID to update</param>
    /// <param name="updateDto">Updated provider category data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated provider category details</returns>
    /// <response code="200">Provider category updated successfully</response>
    /// <response code="400">Invalid provider category data</response>
    /// <response code="404">Provider category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateProviderCategoryDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerCategoryService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle provider category activation status (active/inactive)
    /// </summary>
    /// <param name="id">Provider category ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Provider category activation toggled successfully</response>
    /// <response code="404">Provider category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerCategoryService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a provider category (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Provider category ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Provider category deleted successfully</response>
    /// <response code="404">Provider category not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _providerCategoryService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
