using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Role management controller for handling user roles and permissions
/// </summary>
[ApiController]
[Route("api/roles")]
public class RoleController : BaseController
{
    private readonly IRoleService _roleService;

    public RoleController(IRoleService roleService)
        : base()
    {
        _roleService = roleService;
    }

    /// <summary>
    /// Get paginated list of roles
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Number of items per page (default: 10)</param>
    /// <param name="activeOnly">Filter by active roles only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Paginated list of roles</returns>
    /// <response code="200">Roles retrieved successfully</response>
    /// <response code="400">Invalid pagination parameters</response>
    /// <response code="500">Internal server error</response>
    [HttpGet]
    public async Task<IActionResult> GetPaginated(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetPaginatedAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Get role details by ID
    /// </summary>
    /// <param name="id">Role ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Role details</returns>
    /// <response code="200">Role found</response>
    /// <response code="404">Role not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetByIdAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get role details by name
    /// </summary>
    /// <param name="name">Role name</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Role details</returns>
    /// <response code="200">Role found</response>
    /// <response code="404">Role not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetByName(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetByNameAsync(name, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Get roles formatted for dropdown selection
    /// </summary>
    /// <param name="activeOnly">Filter by active roles only (default: true)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of roles suitable for dropdown/select controls</returns>
    /// <response code="200">Dropdown data retrieved successfully</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("dropdown")]
    public async Task<IActionResult> GetDropdown(
        [FromQuery] bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.GetDropdownAsync(activeOnly, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Create a new role
    /// </summary>
    /// <param name="createDto">Role creation data including name and description</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Created role details</returns>
    /// <response code="200">Role created successfully</response>
    /// <response code="400">Invalid role data or role name already exists</response>
    /// <response code="500">Internal server error</response>
    [HttpPost]
    public async Task<IActionResult> Create(
        [FromBody] CreateRoleDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.CreateAsync(createDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Update an existing role
    /// </summary>
    /// <param name="id">Role ID to update</param>
    /// <param name="updateDto">Updated role data</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated role details</returns>
    /// <response code="200">Role updated successfully</response>
    /// <response code="400">Invalid role data or role name already exists</response>
    /// <response code="404">Role not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        [FromBody] UpdateRoleDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.UpdateAsync(id, updateDto, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Toggle role activation status (active/inactive)
    /// </summary>
    /// <param name="id">Role ID to toggle</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response with new activation status</returns>
    /// <response code="200">Role activation toggled successfully</response>
    /// <response code="404">Role not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("{id}/toggle-activation")]
    public async Task<IActionResult> ToggleActivation(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.ToggleActivationAsync(id, cancellationToken);
        return CreateResponse(result);
    }

    /// <summary>
    /// Soft delete a role (marks as deleted without removing from database)
    /// </summary>
    /// <param name="id">Role ID to delete</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Success response</returns>
    /// <response code="200">Role deleted successfully</response>
    /// <response code="404">Role not found</response>
    /// <response code="500">Internal server error</response>
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDelete(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _roleService.SoftDeleteAsync(id, cancellationToken);
        return CreateResponse(result);
    }
}
