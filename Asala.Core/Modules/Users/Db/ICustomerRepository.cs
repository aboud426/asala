using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.Core.Modules.Users.Db;

public interface ICustomerRepository : IBaseRepository<Customer, int>
{
    Task<Result<Customer?>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<Customer?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Customer>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
    Task<Result<PaginatedResult<Customer>>> SearchByNameAsync(
        string searchTerm,
        int page,
        int pageSize,
        bool? activeOnly = null,
        CustomerSortBy sortBy = CustomerSortBy.Name,
        CancellationToken cancellationToken = default
    );
}
