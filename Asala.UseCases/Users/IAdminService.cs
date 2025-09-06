using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IAdminService
{
    Task<Result<AuthResponseDto>> LoginAdminAsync(
        LoginDto loginDto,
        CancellationToken cancellationToken = default
    );
    Task<Result<PaginatedResult<UserDto>>> GetAllUsersAsync(
        int page = 1,
        int pageSize = 10,
        CancellationToken cancellationToken = default
    );
    Task<Result<UserDto?>> GetUserByIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    );
    Task<Result> AssignRoleToUserAsync(
        int userId,
        int roleId,
        CancellationToken cancellationToken = default
    );
    Task<Result> RemoveRoleFromUserAsync(
        int userId,
        int roleId,
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<RoleDto>>> GetUserRolesAsync(
        int userId,
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<PermissionDto>>> GetUserPermissionsAsync(
        int userId,
        CancellationToken cancellationToken = default
    );
    Task<Result> ToggleUserActivationAsync(
        int userId,
        CancellationToken cancellationToken = default
    );

    Task<Result> SoftDeleteUserAsync(int userId, CancellationToken cancellationToken = default);

    // Provider management methods
    Task<Result<ProviderDto>> CreateProviderAsync(
        CreateProviderByAdminDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<PaginatedResult<ProviderDto>>> GetAllProvidersAsync(
        int page = 1,
        int pageSize = 10,
        bool? activeOnly = null,
        int? parentId = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<ProviderDto>> UpdateProviderAsync(
        int id,
        UpdateProviderByAdminDto updateDto,
        CancellationToken cancellationToken = default
    );
}
