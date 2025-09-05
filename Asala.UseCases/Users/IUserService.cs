using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IUserService
{
    Task<Result<PaginatedResult<UserDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<UserDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<UserDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<UserDto>> CreateAsync(
        CreateUserDto createDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<UserDto?>> UpdateAsync(
        int id,
        UpdateUserDto updateDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);
    
    Task<Result> ChangePasswordAsync(
        int id,
        ChangePasswordDto changePasswordDto,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<IEnumerable<UserDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
}
