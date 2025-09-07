using Asala.Core.Modules.Locations.DTOs;
using Asala.UseCases.Locations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class RegionController : BaseController
{
    private readonly IRegionService _regionService;

    public RegionController(IRegionService regionService)
    {
        _regionService = regionService;
    }

    /// <summary>
    /// Get region by ID
    /// </summary>
    /// <param name="id">Region ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Region details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get all regions with pagination
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="isActive">Filter by active status (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of regions</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.GetAllAsync(page, pageSize, isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get regions dropdown list
    /// </summary>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of regions for dropdown</returns>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown([FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.GetDropdownAsync(isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get region tree structure with all subregions
    /// </summary>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Hierarchical tree of regions and subregions</returns>
    [HttpGet("tree")]
    public async Task<IActionResult> GetRegionTree([FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.GetRegionTreeAsync(isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get subregions of a specific parent region
    /// </summary>
    /// <param name="parentId">Parent region ID</param>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of subregions</returns>
    [HttpGet("{parentId}/subregions")]
    public async Task<IActionResult> GetSubRegions(int parentId, [FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.GetSubRegionsAsync(parentId, isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new region
    /// </summary>
    /// <param name="createDto">Region creation data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created region</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRegionDto createDto, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing region
    /// </summary>
    /// <param name="id">Region ID</param>
    /// <param name="updateDto">Region update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated region</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateRegionDto updateDto, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a region (soft delete)
    /// </summary>
    /// <param name="id">Region ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.DeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Activate a region
    /// </summary>
    /// <param name="id">Region ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.ActivateAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Deactivate a region
    /// </summary>
    /// <param name="id">Region ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken = default)
    {
        var result = await _regionService.DeactivateAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
