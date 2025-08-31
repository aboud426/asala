using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IUserRoleRepository : IRepository<UserRole, int>
{
    Task<Result<IEnumerable<UserRole>>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<UserRole>>> GetByRoleIdAsync(int roleId, CancellationToken cancellationToken = default);
    Task<Result<bool>> ExistsAsync(int userId, int roleId, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<UserRole>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
