using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IEmployeeRepository : IBaseRepository<Employee, int>
{
    Task<Result<Employee?>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<Employee?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Employee>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
