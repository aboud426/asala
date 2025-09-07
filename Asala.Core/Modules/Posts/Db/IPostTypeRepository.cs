using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.Posts.Db;

public interface IPostTypeRepository : IBaseRepository<PostType, int>
{
    Task<Result<PaginatedResult<PostType>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostType?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostType?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<PostType?>> GetByNameWithLocalizationsAsync(
        string name,
        CancellationToken cancellationToken = default
    );

    Task<Result<bool>> ExistsByNameAsync(
        string name,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<IEnumerable<int>>> GetPostTypesMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    );
}
