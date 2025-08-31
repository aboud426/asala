using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class RoleRepository : Repository<Role, int>, IRoleRepository
{
    public RoleRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<Role?>> GetByNameAsync(string name, CancellationToken cancellationToken = default)
    {
        try
        {
            var role = await _dbSet
                .Where(r => !r.IsDeleted)
                .FirstOrDefaultAsync(r => r.Name.ToLower() == name.ToLower(), cancellationToken);

            return Result.Success(role);
        }
        catch (Exception ex)
        {
            return Result.Failure<Role?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByNameAsync(string name, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(r => !r.IsDeleted && r.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(r => r.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }
}
