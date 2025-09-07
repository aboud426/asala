using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;

namespace Asala.Core.Modules.Locations.Db;

public interface IRegionRepository : IRepository<Region, int>
{
    Task<Result<IEnumerable<Region>>> GetRootRegionsAsync(CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Region>>> GetChildrenAsync(int parentId, CancellationToken cancellationToken = default);
    Task<Result<Region?>> GetByIdWithLocalizationsAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Region>>> GetHierarchyAsync(int? rootId = null, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Region>>> SearchByNameAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<Region>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        int? parentId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
