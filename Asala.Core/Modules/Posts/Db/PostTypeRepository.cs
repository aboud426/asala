using System.Linq.Expressions;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Posts.Db;

public class PostTypeRepository : BaseRepository<PostType, int>, IPostTypeRepository
{
    public PostTypeRepository(AsalaDbContext context)
        : base(context, pt => pt.Id) { }

    public async Task<Result<PaginatedResult<PostType>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .PostTypes.Include(pt => pt.PostTypeLocalizations)
                .ThenInclude(ptl => ptl.Language)
                .Where(pt => !pt.IsDeleted);

            if (activeOnly.HasValue)
                query = query.Where(pt => pt.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var postTypes = await query
                .OrderByDescending(pt => pt.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<PostType>(
                items: postTypes,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<PostType>>(MessageCodes.DB_ERROR);
        }
    }

    public async Task<Result<PostType?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postType = await _context
                .PostTypes.Include(pt => pt.PostTypeLocalizations)
                .ThenInclude(ptl => ptl.Language)
                .FirstOrDefaultAsync(pt => pt.Id == id && !pt.IsDeleted, cancellationToken);

            return Result.Success(postType);
        }
        catch (Exception ex)
        {
            return Result.Failure<PostType?>(MessageCodes.DB_ERROR);
        }
    }

    public async Task<Result<PostType?>> GetByNameAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postType = await _context.PostTypes.FirstOrDefaultAsync(
                pt => pt.Name.ToLower() == name.ToLower() && !pt.IsDeleted,
                cancellationToken
            );

            return Result.Success(postType);
        }
        catch (Exception ex)
        {
            return Result.Failure<PostType?>(MessageCodes.DB_ERROR);
        }
    }

    public async Task<Result<PostType?>> GetByNameWithLocalizationsAsync(
        string name,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var postType = await _context
                .PostTypes.Include(pt => pt.PostTypeLocalizations)
                .ThenInclude(ptl => ptl.Language)
                .FirstOrDefaultAsync(
                    pt => pt.Name.ToLower() == name.ToLower() && !pt.IsDeleted,
                    cancellationToken
                );

            return Result.Success(postType);
        }
        catch (Exception ex)
        {
            return Result.Failure<PostType?>(MessageCodes.DB_ERROR);
        }
    }

    public async Task<Result<bool>> ExistsByNameAsync(
        string name,
        int? excludeId = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context.PostTypes.Where(pt =>
                pt.Name.ToLower() == name.ToLower() && !pt.IsDeleted
            );

            if (excludeId.HasValue)
                query = query.Where(pt => pt.Id != excludeId.Value);

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR);
        }
    }

    public async Task<Result<IEnumerable<int>>> GetPostTypesMissingTranslationsAsync(
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

            // Get PostTypes that don't have translations for all languages
            var postTypesMissingTranslations = await _context
                .PostTypes.Where(pt => !pt.IsDeleted && pt.IsActive)
                .Where(pt =>
                    pt.PostTypeLocalizations.Count(ptl => !ptl.IsDeleted && ptl.IsActive)
                    < languagesCount
                )
                .Select(pt => pt.Id)
                .ToListAsync(cancellationToken);

            return Result.Success(postTypesMissingTranslations.AsEnumerable());
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<int>>(MessageCodes.DB_ERROR);
        }
    }
}
