using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Posts.Models;

namespace Asala.Core.Modules.Posts.Db;

public interface IPostRepository : IBaseRepository<Post, int>
{
    Task<Result<PaginatedResult<Post>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );

    Task<Result<Post?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    );
}
