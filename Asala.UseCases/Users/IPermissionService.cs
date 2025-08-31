using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IPermissionService
{
    Task<Result<PaginatedResult<PermissionDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<PermissionDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<PermissionDto>> CreateAsync(
        CreatePermissionDto createDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<PermissionDto?>> UpdateAsync(
        int id,
        UpdatePermissionDto updateDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result<IEnumerable<PermissionDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
}
