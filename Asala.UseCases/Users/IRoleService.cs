using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IRoleService
{
    Task<Result<PaginatedResult<RoleDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<RoleDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<RoleDto?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<RoleDto>> CreateAsync(
        CreateRoleDto createDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<RoleDto?>> UpdateAsync(
        int id,
        UpdateRoleDto updateDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result<IEnumerable<RoleDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
}
