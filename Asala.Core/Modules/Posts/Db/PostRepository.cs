using System.Linq.Expressions;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Posts.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Posts.Db;

public class PostRepository : BaseRepository<Post, int>, IPostRepository
{
    public PostRepository(AsalaDbContext context)
        : base(context, p => p.Id) { }

    public async Task<Result<PaginatedResult<Post>>> GetPaginatedWithLocalizationsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var query = _context
                .Posts.Include(p => p.PostLocalizeds)
                .ThenInclude(pl => pl.Language)
                .Include(p => p.PostType)
                .Include(p => p.User)
                .Where(p => !p.IsDeleted);

            if (activeOnly.HasValue)
                query = query.Where(p => p.IsActive == activeOnly.Value);

            var totalCount = await query.CountAsync(cancellationToken);

            var posts = await query
                .OrderByDescending(p => p.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var result = new PaginatedResult<Post>(
                items: posts,
                totalCount: totalCount,
                page: page,
                pageSize: pageSize
            );

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<Post>>(MessageCodes.DB_ERROR);
        }
    }

    public async Task<Result<Post?>> GetByIdWithLocalizationsAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var post = await _context
                .Posts.Include(p => p.PostLocalizeds)
                .ThenInclude(pl => pl.Language)
                .Include(p => p.PostType)
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted, cancellationToken);

            return Result.Success(post);
        }
        catch (Exception ex)
        {
            return Result.Failure<Post?>(MessageCodes.DB_ERROR);
        }
    }
}
