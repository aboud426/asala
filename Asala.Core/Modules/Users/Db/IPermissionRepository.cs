using System.Linq.Expressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IPermissionRepository : IRepository<Permission, int>
{
    Task<Result<Permission?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<bool>> ExistsByNameAsync(
        string name,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated permissions with their localizations
    /// </summary>
    Task<Result<PaginatedResult<Permission>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets permission IDs that are missing translations
    /// </summary>
    Task<Result<IEnumerable<int>>> GetPermissionsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
    Task<Result<IEnumerable<Permission>>> GetWithLocalizationsAsync(Expression<Func<Permission, bool>> filter);
}
