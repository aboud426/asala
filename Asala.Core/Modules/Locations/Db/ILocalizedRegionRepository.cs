using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;

namespace Asala.Core.Modules.Locations.Db;

public interface ILocalizedRegionRepository : IRepository<LocalizedRegion, int>
{
    Task<Result<IEnumerable<LocalizedRegion>>> GetByRegionIdAsync(int regionId, CancellationToken cancellationToken = default);
    Task<Result<LocalizedRegion?>> GetByRegionAndLanguageAsync(int regionId, int languageId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<LocalizedRegion>>> GetByLanguageIdAsync(int languageId, CancellationToken cancellationToken = default);
}
