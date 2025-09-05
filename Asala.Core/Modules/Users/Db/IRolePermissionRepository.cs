using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IRolePermissionRepository : IRepository<RolePermission, int>
{
    Task<Result<IEnumerable<RolePermission>>> GetByRoleIdAsync(int roleId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<RolePermission>>> GetByPermissionIdAsync(int permissionId, CancellationToken cancellationToken = default);
    Task<Result<bool>> ExistsAsync(int roleId, int permissionId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<RolePermission>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
