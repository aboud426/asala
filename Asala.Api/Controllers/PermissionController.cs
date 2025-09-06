using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Permission management controller for handling user permissions and access control
/// </summary>
[ApiController]
[Route("api/permissions")]
public class PermissionController : BaseController
{
    private readonly IPermissionService _permissionService;

    public PermissionController(IPermissionService permissionService)
        : base()
    {
        _permissionService = permissionService;
    }

    /// <summary>
    /// Get paginated list of permissions
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active permissions only (default: null for all)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of permissions with localizations</returns>
    /// <response code="200">Permissions retrieved successfully</response>
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
        var result = await _permissionService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get permission details by ID with localizations
    /// </summary>
    /// <param name="id">Permission ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Permission details with localizations</returns>
    /// <response code="200">Permission found</response>
    /// <response code="404">Permission not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id, CancellationToken cancellationToken = default)
    {
        var result = await _permissionService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get permission details by name with localizations
    /// </summary>
    /// <param name="name">Permission name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Permission details with localizations</returns>
    /// <response code="200">Permission found</response>
    /// <response code="404">Permission not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("by-name/{name}")]
    public async Task<IActionResult> GetByName(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.GetByNameAsync(name, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get permissions formatted for dropdown selection
    /// </summary>
    /// <param name="activeOnly">Filter by active permissions only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of permissions suitable for dropdown/select controls</returns>
    /// <response code="200">Dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new permission with optional localizations
    /// </summary>
    /// <param name="createDto">Permission creation data including name, description, and optional localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created permission details with localizations</returns>
    /// <response code="200">Permission created successfully</response>
    /// <response code="400">Invalid permission data or permission name already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreatePermissionDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing permission including its localizations
    /// </summary>
    /// <param name="id">Permission ID to update</param>
    /// <param name="updateDto">Updated permission data including localizations</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated permission details with localizations</returns>
    /// <response code="200">Permission updated successfully</response>
    /// <response code="400">Invalid permission data or permission name already exists</response>
    /// <response code="404">Permission not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdatePermissionDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle permission activation status (active/inactive)
    /// </summary>
    /// <param name="id">Permission ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Permission activation toggled successfully</response>
    /// <response code="404">Permission not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get permissions that are missing translations in one or more active languages
    /// </summary>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of permission IDs that need translations</returns>
    /// <response code="200">Missing translations retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("missing-translations")]
    public async Task<IActionResult> GetPermissionsMissingTranslations(
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.GetPermissionsMissingTranslationsAsync(cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a permission (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Permission ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Permission deleted successfully</response>
    /// <response code="404">Permission not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _permissionService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
