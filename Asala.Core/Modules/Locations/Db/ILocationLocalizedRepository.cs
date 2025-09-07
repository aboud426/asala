using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Locations.Models;

namespace Asala.Core.Modules.Locations.Db;

public interface ILocationLocalizedRepository : IRepository<LocationLocalized, int>
{
    Task<Result<IEnumerable<LocationLocalized>>> GetByLocationIdAsync(int locationId, CancellationToken cancellationToken = default);
    Task<Result<LocationLocalized?>> GetByLocationAndLanguageAsync(int locationId, int languageId, CancellationToken cancellationToken = default);
    Task<Result<IEnumerable<LocationLocalized>>> GetByLanguageIdAsync(int languageId, CancellationToken cancellationToken = default);
}
