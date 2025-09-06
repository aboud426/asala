using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface ICurrencyRepository : IRepository<Currency, int>
{
    Task<Result<Currency?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<Currency?>> GetByCodeAsync(
        string code,
        CancellationToken cancellationToken = default
    );

    Task<Result<bool>> ExistsByNameAsync(
        string name,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<bool>> ExistsByCodeAsync(
        string code,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated currencies with their localizations
    /// </summary>
    Task<Result<PaginatedResult<Currency>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets currency IDs that are missing translations
    /// </summary>
    Task<Result<IEnumerable<int>>> GetCurrenciesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
