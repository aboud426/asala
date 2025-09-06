using Asala.Core.Modules.Users.DTOs;
using Asala.UseCases.Users;
using Microsoft.AspNetCore.Mvc;

namespace Asala.Api.Controllers;

/// <summary>
/// Role Permission management controller for handling role-permission relationships with language support
/// </summary>
[ApiController]
[Route("api/role-permissions")]
public class RolePermissionController : BaseController
{
    private readonly IRolePermissionService _rolePermissionService;

    public RolePermissionController(IRolePermissionService rolePermissionService)
        : base()
    {
        _rolePermissionService = rolePermissionService;
    }

    /// <summary>
    /// Get permissions by role ID with optional language support
    /// </summary>
    /// <param name="roleId">Role ID to get permissions for</param>
    /// <param name="languageCode">Language code for localized permission names (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of permissions for the specified role with localization support</returns>
    /// <response code="200">Permissions retrieved successfully</response>
    /// <response code="400">Invalid role ID</response>
    /// <response code="404">Role not found</response>
    /// <response code="500">Internal server error</response>
    [HttpGet("role/{roleId}/permissions")]
    public async Task<IActionResult> GetPermissionsByRoleId(
        int roleId,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _rolePermissionService.GetPermissionsByRoleIdAsync(
            roleId,
            languageCode,
            cancellationToken
        );
        return CreateResponse(result);
    }

    /// <summary>
    /// Set/Save specific permissions for a role (replaces existing permissions)
    /// </summary>
    /// <param name="roleId">Role ID to set permissions for</param>
    /// <param name="request">List of permission IDs to assign to the role</param>
    /// <param name="languageCode">Language code for localized permission names in response (optional)</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Updated list of permissions for the role with localization support</returns>
    /// <response code="200">Role permissions updated successfully</response>
    /// <response code="400">Invalid role ID or permission IDs</response>
    /// <response code="404">Role or one or more permissions not found</response>
    /// <response code="500">Internal server error</response>
    [HttpPut("role/{roleId}/permissions")]
    public async Task<IActionResult> SaveRolePermissions(
        int roleId,
        [FromBody] SaveRolePermissionsRequest request,
        [FromQuery] string? languageCode = null,
        CancellationToken cancellationToken = default
    )
    {
        if (request?.PermissionIds == null)
        {
            return BadRequest("Permission IDs are required");
        }

        var result = await _rolePermissionService.SaveRolePermissionsAsync(
            roleId,
            request.PermissionIds,
            languageCode,
            cancellationToken
        );
        return CreateResponse(result);
    }
}

/// <summary>
/// Request model for saving role permissions
/// </summary>
public class SaveRolePermissionsRequest
{
    /// <summary>
    /// List of permission IDs to assign to the role
    /// </summary>
    public IEnumerable<int> PermissionIds { get; set; } = new List<int>();
}
