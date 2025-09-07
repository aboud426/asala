using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Locations.Db;

public class LocalizedRegionRepository : Repository<LocalizedRegion, int>, ILocalizedRegionRepository
{
    public LocalizedRegionRepository(AsalaDbContext context) : base(context) { }

    public async Task<Result<IEnumerable<LocalizedRegion>>> GetByRegionIdAsync(int regionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var localizations = await _context.LocalizedRegions
                .Include(lr => lr.Language)
                .Include(lr => lr.Region)
                .Where(lr => lr.RegionId == regionId && !lr.IsDeleted)
                .OrderBy(lr => lr.Language.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<LocalizedRegion>>(localizations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<LocalizedRegion>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<LocalizedRegion?>> GetByRegionAndLanguageAsync(int regionId, int languageId, CancellationToken cancellationToken = default)
    {
        try
        {
            var localization = await _context.LocalizedRegions
                .Include(lr => lr.Language)
                .Include(lr => lr.Region)
                .FirstOrDefaultAsync(lr => lr.RegionId == regionId && lr.LanguageId == languageId && !lr.IsDeleted, cancellationToken);

            return Result.Success(localization);
        }
        catch (Exception ex)
        {
            return Result.Failure<LocalizedRegion?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<LocalizedRegion>>> GetByLanguageIdAsync(int languageId, CancellationToken cancellationToken = default)
    {
        try
        {
            var localizations = await _context.LocalizedRegions
                .Include(lr => lr.Language)
                .Include(lr => lr.Region)
                .Where(lr => lr.LanguageId == languageId && !lr.IsDeleted)
                .OrderBy(lr => lr.LocalizedName)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<LocalizedRegion>>(localizations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<LocalizedRegion>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
