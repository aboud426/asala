using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IProviderRepository : IBaseRepository<Provider, int>
{
    Task<Result<Provider?>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default);
    Task<Result<Provider?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Provider>>> GetByParentIdAsync(int parentId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Provider>>> GetTopLevelProvidersAsync(CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Provider>>> GetPaginatedWithUserAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        int? parentId = null,
        CancellationToken cancellationToken = default
    );
}
