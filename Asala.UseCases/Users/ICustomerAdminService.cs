using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface ICustomerAdminService
{
    Task<Result<PaginatedResult<CustomerDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<CustomerDto?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    );

    Task<Result<CustomerDto>> CreateAsync(
        CreateCustomerAdminDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<CustomerDto?>> UpdateAsync(
        int userId,
        UpdateCustomerDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> SoftDeleteAsync(int userId, CancellationToken cancellationToken = default);

    Task<Result> ToggleActivationAsync(int userId, CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<CustomerDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
}
