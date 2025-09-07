using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Locations.Db;

public class LocationLocalizedRepository : Repository<LocationLocalized, int>, ILocationLocalizedRepository
{
    public LocationLocalizedRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<IEnumerable<LocationLocalized>>> GetByLocationIdAsync(int locationId, CancellationToken cancellationToken = default)
    {
        try
        {
            var localizations = await _context.LocationLocalizeds
                .Include(ll => ll.Language)
                .Include(ll => ll.Location)
                .Where(ll => ll.LocationId == locationId && !ll.IsDeleted)
                .OrderBy(ll => ll.Language.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<LocationLocalized>>(localizations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<LocationLocalized>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<LocationLocalized?>> GetByLocationAndLanguageAsync(int locationId, int languageId, CancellationToken cancellationToken = default)
    {
        try
        {
            var localization = await _context.LocationLocalizeds
                .Include(ll => ll.Language)
                .Include(ll => ll.Location)
                .FirstOrDefaultAsync(ll => ll.LocationId == locationId && ll.LanguageId == languageId && !ll.IsDeleted, cancellationToken);

            return Result.Success(localization);
        }
        catch (Exception ex)
        {
            return Result.Failure<LocationLocalized?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<LocationLocalized>>> GetByLanguageIdAsync(int languageId, CancellationToken cancellationToken = default)
    {
        try
        {
            var localizations = await _context.LocationLocalizeds
                .Include(ll => ll.Language)
                .Include(ll => ll.Location)
                .Where(ll => ll.LanguageId == languageId && !ll.IsDeleted)
                .OrderBy(ll => ll.LocalizedName)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<LocationLocalized>>(localizations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<LocationLocalized>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
