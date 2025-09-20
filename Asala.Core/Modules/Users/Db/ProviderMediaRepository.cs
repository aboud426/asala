using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class ProviderMediaRepository : BaseRepository<ProviderMedia, int>, IProviderMediaRepository
{
    public ProviderMediaRepository(AsalaDbContext context)
        : base(context, pm => pm.Id) { }

    public async Task<Result<IEnumerable<ProviderMedia>>> GetByProviderIdAsync(
        int providerId,
        MediaType? mediaType = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _dbSet.Where(pm => pm.ProviderId == providerId);

            if (mediaType.HasValue)
            {
                query = query.Where(pm => pm.MediaType == mediaType.Value);
            }

            var media = await query.OrderBy(pm => pm.CreatedAt).ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<ProviderMedia>>(media);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<ProviderMedia>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<string>>> GetImageUrlsByProviderIdAsync(
        int providerId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var imageUrls = await _dbSet
                .Where(pm => pm.ProviderId == providerId && pm.MediaType == MediaType.Image)
                .OrderBy(pm => pm.CreatedAt)
                .Select(pm => pm.Url)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<string>>(imageUrls);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<string>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<ProviderMedia?>> GetByUrlAsync(
        string url,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var media = await _dbSet.FirstOrDefaultAsync(pm => pm.Url == url, cancellationToken);

            return Result.Success(media);
        }
        catch (Exception ex)
        {
            return Result.Failure<ProviderMedia?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<ProviderMedia>>> GetPaginatedByProviderIdAsync(
        int providerId,
        int page,
        int pageSize,
        MediaType? mediaType = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0)
                page = 1;
            if (pageSize <= 0)
                pageSize = 10;

            var query = _dbSet.Where(pm => pm.ProviderId == providerId);

            if (mediaType.HasValue)
            {
                query = query.Where(pm => pm.MediaType == mediaType.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var media = await query
                .OrderBy(pm => pm.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<ProviderMedia>(
                media,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<ProviderMedia>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> DeleteByProviderIdAsync(
        int providerId,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var mediaToDelete = await _dbSet
                .Where(pm => pm.ProviderId == providerId)
                .ToListAsync(cancellationToken);

            foreach (var media in mediaToDelete)
            {
                media.IsDeleted = true;
                media.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync(cancellationToken);
            return Result.Success(true);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }
}
