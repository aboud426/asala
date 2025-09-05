using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class RolePermissionRepository : Repository<RolePermission, int>, IRolePermissionRepository
{
    public RolePermissionRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<IEnumerable<RolePermission>>> GetByRoleIdAsync(int roleId, CancellationToken cancellationToken = default)
    {
        try
        {
            var rolePermissions = await _dbSet
                .Where(rp => !rp.IsDeleted && rp.RoleId == roleId)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<RolePermission>>(rolePermissions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<RolePermission>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<IEnumerable<RolePermission>>> GetByPermissionIdAsync(int permissionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var rolePermissions = await _dbSet
                .Where(rp => !rp.IsDeleted && rp.PermissionId == permissionId)
                .ToListAsync(cancellationToken);

            return Result.Success<IEnumerable<RolePermission>>(rolePermissions);
        }
        catch (Exception ex)
        {
            return Result.Failure<IEnumerable<RolePermission>>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsAsync(int roleId, int permissionId, CancellationToken cancellationToken = default)
    {
        try
        {
            var exists = await _dbSet
                .Where(rp => !rp.IsDeleted)
                .AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId, cancellationToken);

            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<PaginatedResult<RolePermission>>> GetPaginatedWithDetailsAsync(
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

            var query = _dbSet.Where(rp => !rp.IsDeleted);

            if (activeOnly.HasValue)
            {
                query = query.Where(rp => rp.IsActive == activeOnly.Value);
            }

            var totalCount = await query.CountAsync(cancellationToken);

            var rolePermissions = await query
                .OrderBy(rp => rp.RoleId)
                .ThenBy(rp => rp.PermissionId)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync(cancellationToken);

            var paginatedResult = new PaginatedResult<RolePermission>(
                rolePermissions,
                totalCount,
                page,
                pageSize
            );

            return Result.Success(paginatedResult);
        }
        catch (Exception ex)
        {
            return Result.Failure<PaginatedResult<RolePermission>>(MessageCodes.DB_ERROR, ex);
        }
    }
}
