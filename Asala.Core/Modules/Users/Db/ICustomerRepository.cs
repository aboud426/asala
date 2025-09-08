using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface ICustomerRepository : IBaseRepository<Customer, int>
{
    Task<Result<Customer?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    );
    Task<Result<PaginatedResult<Customer>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
