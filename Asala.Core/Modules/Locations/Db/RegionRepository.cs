using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Locations.Db;

public class RegionRepository : Repository<Region, int>, IRegionRepository
{
    public RegionRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<IEnumerable<Region>>> GetRootRegionsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var regions = await _context
                .Regions.Include(r => r.LocalizedRegions)
                .ThenInclude(lr => lr.Language)
                .Where(r => r.ParentId == null && !r.IsDeleted)
                .OrderBy(r => r.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Region>>(regions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Region>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Region>>> GetChildrenAsync(
        int parentId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var regions = await _context
                .Regions.Include(r => r.LocalizedRegions)
                .ThenInclude(lr => lr.Language)
                .Where(r => r.ParentId == parentId && !r.IsDeleted)
                .OrderBy(r => r.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Region>>(regions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Region>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Region?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var region = await _context
                .Regions.Include(r => r.Parent)
                .Include(r => r.InverseParent)
                .Include(r => r.LocalizedRegions)
                .ThenInclude(lr => lr.Language)
                .FirstOrDefaultAsync(r => r.Id == id && !r.IsDeleted, cancellationToken);

            return Result.Success(region);
        }
        catch (Exception ex)
        {
            return Result.Failure<Region?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Region>>> GetHierarchyAsync(
        int? rootId = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .Regions.Include(r => r.InverseParent)
                .Include(r => r.LocalizedRegions)
                .ThenInclude(lr => lr.Language)
                .Where(r => !r.IsDeleted);

            if (rootId.HasValue)
                query = query.Where(r => r.Id == rootId.Value || r.ParentId == rootId.Value);
            else
                query = query.Where(r => r.ParentId == null);

            var regions = await query.OrderBy(r => r.Name).ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Region>>(regions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Region>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Region>>> SearchByNameAsync(
        string searchTerm,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var regions = await _context
                .Regions.Include(r => r.Parent)
                .Include(r => r.LocalizedRegions)
                .ThenInclude(lr => lr.Language)
                .Where(r =>
                    (
                        r.Name.ToLower().Contains(searchTerm.ToLower())
                        || r.LocalizedRegions.Any(lr =>
                            lr.LocalizedName.ToLower().Contains(searchTerm.ToLower())
                        )
                    ) && !r.IsDeleted
                )
                .OrderBy(r => r.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Region>>(regions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Region>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Region>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        int? parentId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .Regions.Include(r => r.Parent)
                .Include(r => r.LocalizedRegions)
                .ThenInclude(lr => lr.Language)
                .Where(r => !r.IsDeleted);

            if (parentId.HasValue)
                query = query.Where(r => r.ParentId == parentId.Value);

            if (activeOnly.HasValue)
                query = query.Where(r => r.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var regions = await query
                .OrderBy(r => r.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<Region>(
                items: regions,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Region>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetRegionsMissingTranslationsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Get all languages count
            var languagesCount = await _context
                .Languages.Where(l => l.IsActive && !l.IsDeleted)
                .CountAsync(cancellationToken);

            if (languagesCount == 0)
                return Result.Success(Enumerable.Empty<int>());

            // Get Regions that don't have translations for all languages
            var regionsMissingTranslations = await _context
                .Regions.Where(r => !r.IsDeleted && r.IsActive)
                .Where(r =>
                    r.LocalizedRegions.Count(lr => !lr.IsDeleted && lr.IsActive) < languagesCount
                )
                .Select(r => r.Id)
                .ToListAsync(cancellationToken);

            return Result.Success(regionsMissingTranslations.AsEnumerable());
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<int>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
