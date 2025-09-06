using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IRolePermissionService
{
    /// <summary>
    /// Get permissions by role ID with language support
    /// </summary>
    Task<Result<IEnumerable<PermissionDto>>> GetPermissionsByRoleIdAsync(
        int roleId,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Set/Save specific permissions for a role (replaces existing permissions)
    /// </summary>
    Task<Result<IEnumerable<PermissionDto>>> SaveRolePermissionsAsync(
        int roleId,
        IEnumerable<int> permissionIds,
        string? languageCode = null,
        CancellationToken cancellationToken = default
    );
}
