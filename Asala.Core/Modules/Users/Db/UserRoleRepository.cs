using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class UserRoleRepository : Repository<UserRole, int>, IUserRoleRepository
{
    public UserRoleRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<IEnumerable<UserRole>>> GetByUserIdAsync(int userId, CancellationToken cancellationToken = default)
    {
        try
        {
            var userRoles = await _dbSet
                .Where(ur => !ur.IsDeleted && ur.UserId == userId)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<UserRole>>(userRoles);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<UserRole>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<UserRole>>> GetByRoleIdAsync(int roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var userRoles = await _dbSet
                .Where(ur => !ur.IsDeleted && ur.RoleId == roleId)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<UserRole>>(userRoles);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<UserRole>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsAsync(int userId, int roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var exists = await _dbSet
                .Where(ur => !ur.IsDeleted)
                .AnyAsync(ur => ur.UserId == userId && ur.RoleId == roleId, cancellationToken);

            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<UserRole>>> GetPaginatedWithDetailsAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            if (page <= 0) page = 1;
            if (pageSize <= 0) pageSize = 10;

            var query = _dbSet.Where(ur => !ur.IsDeleted);

            if (activeOnly.HasValue)
            {
                query = query.Where(ur => ur.IsActive == activeOnly.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var userRoles = await query
                .OrderBy(ur => ur.UserId)
                .ThenBy(ur => ur.RoleId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<UserRole>(
                userRoles,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<UserRole>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
