using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IEmployeeService
{
    Task<Result<PaginatedResult<EmployeeDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );

    Task<Result<EmployeeDto?>> GetByIdAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<EmployeeDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    );

    Task<Result<EmployeeDto>> CreateAsync(
        CreateEmployeeDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<EmployeeDto>> CreateWithoutLocationAsync(
        CreateEmployeeWithoutLocationDto createDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<EmployeeDto?>> UpdateAsync(
        int id,
        UpdateEmployeeDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result<EmployeeDto?>> UpdateWithoutLocationAsync(
        int id,
        UpdateEmployeeWithoutLocationDto updateDto,
        CancellationToken cancellationToken = default
    );

    Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default);

    Task<Result> ToggleActivationAsync(int id, CancellationToken cancellationToken = default);

    Task<Result<IEnumerable<EmployeeDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );

    Task<Result<PaginatedResult<EmployeeDto>>> SearchByNameAsync(
        string searchTerm,
        int page = 1,
        int pageSize = 10,
        bool activeOnly = true,
        EmployeeSortBy sortBy = EmployeeSortBy.Name,
        CancellationToken cancellationToken = default
    );
}
