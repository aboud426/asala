using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IRoleRepository : IRepository<Role, int>
{
    Task<Result<Role?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<bool>> ExistsByNameAsync(
        string name,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated roles with their localizations
    /// </summary>
    Task<Result<PaginatedResult<Role>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets role IDs that are missing translations
    /// </summary>
    Task<Result<IEnumerable<int>>> GetRolesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
