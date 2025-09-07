using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;

namespace Asala.Core.Modules.Locations.Db;

public interface ILocationRepository : IRepository<Location, int>
{
    Task<Result<IEnumerable<Location>>> GetByRegionIdAsync(int regionId, CancellationToken cancellationToken = default);
    Task<Result<Location?>> GetByIdWithLocalizationsAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Location>>> SearchByNameAsync(string searchTerm, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<Location>>> GetNearbyLocationsAsync(
        decimal latitude,
        decimal longitude,
        double radiusKm,
        CancellationToken cancellationToken = default
    );
    Task<Result<PaginatedResult<Location>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        int? regionId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    );
}
