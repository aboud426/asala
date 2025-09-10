using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Locations.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Locations.Db;

public class LocationRepository : Repository<Location, int>, ILocationRepository
{
    public LocationRepository(AsalaDbContext context)
        : base(context) { }

    public async Task<Result<IEnumerable<Location>>> GetByRegionIdAsync(
        int regionId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var locations = await _context
                .Locations.Include(l => l.Region)
                .Include(l => l.User)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .Where(l => l.RegionId == regionId && !l.IsDeleted)
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Location>>(locations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Location>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<Location?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var location = await _context
                .Locations.Include(l => l.Region)
                .ThenInclude(r => r.Parent)
                .Include(l => l.User)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .FirstOrDefaultAsync(l => l.Id == id && !l.IsDeleted, cancellationToken);

            return Result.Success(location);
        }
        catch (Exception ex)
        {
            return Result.Failure<Location?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Location>>> SearchByNameAsync(
        string searchTerm,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var locations = await _context
                .Locations.Include(l => l.Region)
                .Include(l => l.User)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .Where(l =>
                    (
                        l.Name.ToLower().Contains(searchTerm.ToLower())
                        || l.LocationLocalizeds.Any(ll =>
                            ll.LocalizedName.ToLower().Contains(searchTerm.ToLower())
                        )
                        || (
                            l.Region != null
                            && l.Region.Name.ToLower().Contains(searchTerm.ToLower())
                        )
                    ) && !l.IsDeleted
                )
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Location>>(locations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Location>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Location>>> GetNearbyLocationsAsync(
        decimal latitude,
        decimal longitude,
        double radiusKm,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Using Haversine formula approximation for nearby locations
            // Note: For production, consider using spatial data types and functions
            var locations = await _context
                .Locations.Include(l => l.Region)
                .Include(l => l.User)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .Where(l => !l.IsDeleted)
                .ToListAsync(cancellationToken);

            // Filter by distance in memory (for simplicity)
            // In production, use spatial queries in the database
            var nearbyLocations = locations
                .Where(l =>
                {
                    var distance = CalculateDistance(
                        (double)latitude,
                        (double)longitude,
                        (double)l.Latitude,
                        (double)l.Longitude
                    );
                    return distance <= radiusKm;
                })
                .OrderBy(l =>
                    CalculateDistance(
                        (double)latitude,
                        (double)longitude,
                        (double)l.Latitude,
                        (double)l.Longitude
                    )
                );

            return Result.Success<IEnumerable<Location>>(nearbyLocations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Location>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<Location>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        int? regionId = null,
        int? userId = null,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .Locations.Include(l => l.Region)
                .Include(l => l.User)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .Where(l => !l.IsDeleted);

            if (regionId.HasValue)
                query = query.Where(l => l.RegionId == regionId.Value);

            if (userId.HasValue)
                query = query.Where(l => l.UserId == userId.Value);

            if (activeOnly.HasValue)
                query = query.Where(l => l.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var locations = await query
                .OrderBy(l => l.Name)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<Location>(
                items: locations,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Location>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<Location>>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var locations = await _context
                .Locations.Include(l => l.Region)
                .Include(l => l.User)
                .Include(l => l.LocationLocalizeds)
                .ThenInclude(ll => ll.Language)
                .Where(l => l.UserId == userId && !l.IsDeleted)
                .OrderBy(l => l.Name)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<Location>>(locations);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<Location>>(MessageCodes.DB_ERROR, ex);
        }
    }

    private static double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
    {
        // Haversine formula
        const double R = 6371; // Earth's radius in kilometers
        var dLat = ToRadians(lat2 - lat1);
        var dLon = ToRadians(lon2 - lon1);
        var a =
            Math.Sin(dLat / 2) * Math.Sin(dLat / 2)
            + Math.Cos(ToRadians(lat1))
                * Math.Cos(ToRadians(lat2))
                * Math.Sin(dLon / 2)
                * Math.Sin(dLon / 2);
        var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
        return R * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}
