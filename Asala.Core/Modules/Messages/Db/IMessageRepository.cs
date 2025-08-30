using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Messages.Models;

namespace Asala.Core.Modules.Messages.Db;

public interface IMessageRepository : IRepository<Message, int>
{
    /// <summary>
    /// Gets a message by its key including all localizations
    /// </summary>
    Task<Result<Message?>> GetByKeyWithLocalizationsAsync(
        string key,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets paginated messages with their localizations
    /// </summary>
    Task<Result<PaginatedResult<Message>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Gets a message by ID including all localizations
    /// </summary>
    Task<Result<Message?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// Checks if a message with the specified key exists
    /// </summary>
    Task<Result<bool>> ExistsByKeyAsync(
        string key,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    );
}
