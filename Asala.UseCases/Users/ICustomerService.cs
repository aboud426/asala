using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface ICustomerService
{
    Task<Result<PaginatedResult<CustomerDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<CustomerDto?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<CustomerDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    );
    
    Task<Result<CustomerDto>> CreateAsync(
        CreateCustomerDto createDto,
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
    
    Task<Result<PaginatedResult<CustomerDto>>> SearchByNameAsync(
        string searchTerm,
        int page = 1,
        int pageSize = 10,
        bool activeOnly = true,
        CustomerSortBy sortBy = CustomerSortBy.Name,
        CancellationToken cancellationToken = default
    );
}
