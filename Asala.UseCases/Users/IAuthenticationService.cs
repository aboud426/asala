using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IAuthenticationService
{
    Task<Result<AuthResponseDto>> LoginCustomerAsync(
        CustomerLoginDto loginDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<AuthResponseDto>> LoginProviderAsync(
        ProviderLoginDto loginDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<AuthResponseDto>> LoginEmployeeAsync(
        LoginDto loginDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> ValidatePasswordAsync(
        int userId,
        string password,
        CancellationToken cancellationToken = default
    );

    Task<Result> ChangePasswordAsync(
        int userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken = default
    );
}
