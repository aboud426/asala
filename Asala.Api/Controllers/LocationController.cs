using Asala.Core.Modules.Locations.DTOs;
using Asala.UseCases.Locations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class LocationController : BaseController
{
    private readonly ILocationService _locationService;

    public LocationController(ILocationService locationService)
    {
        _locationService = locationService;
    }

    /// <summary>
    /// Get location by ID
    /// </summary>
    /// <param name="id">Location ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Location details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get all locations with pagination
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="isActive">Filter by active status (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of locations</returns>
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? isActive = null, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.GetAllAsync(page, pageSize, isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get locations by region with pagination
    /// </summary>
    /// <param name="regionId">Region ID</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of locations in the specified region</returns>
    [HttpGet("region/{regionId}")]
    public async Task<IActionResult> GetByRegion(int regionId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.GetByRegionAsync(regionId, page, pageSize, isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get locations dropdown list
    /// </summary>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of locations for dropdown</returns>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown([FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.GetDropdownAsync(isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get locations dropdown list filtered by region
    /// </summary>
    /// <param name="regionId">Region ID</param>
    /// <param name="isActive">Filter by active status (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of locations in the specified region for dropdown</returns>
    [HttpGet("dropdown/region/{regionId}")]
    public async Task<IActionResult> GetDropdownByRegion(int regionId, [FromQuery] bool? isActive = true, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.GetDropdownByRegionAsync(regionId, isActive, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new location
    /// </summary>
    /// <param name="createDto">Location creation data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created location</returns>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateLocationDto createDto, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing location
    /// </summary>
    /// <param name="id">Location ID</param>
    /// <param name="updateDto">Location update data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated location</returns>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateLocationDto updateDto, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Delete a location (soft delete)
    /// </summary>
    /// <param name="id">Location ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.DeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Activate a location
    /// </summary>
    /// <param name="id">Location ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpPatch("{id}/activate")]
    public async Task<IActionResult> Activate(int id, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.ActivateAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Deactivate a location
    /// </summary>
    /// <param name="id">Location ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success or failure result</returns>
    [HttpPatch("{id}/deactivate")]
    public async Task<IActionResult> Deactivate(int id, CancellationToken cancellationToken = default)
    {
        var result = await _locationService.DeactivateAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
