using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class UserRepository : Repository<User, int>, IUserRepository
{
    public UserRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<User?>> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _dbSet
                .Where(u => !u.IsDeleted)
                .FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower(), cancellationToken);

            return Result.Success(user);
        }
        catch (Exception ex)
        {
            return Result.Failure<User?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<User?>> GetByPhoneNumberAsync(string phoneNumber, CancellationToken cancellationToken = default)
    {
        try
        {
            var user = await _dbSet
                .Where(u => !u.IsDeleted)
                .FirstOrDefaultAsync(u => u.PhoneNumber == phoneNumber, cancellationToken);

            return Result.Success(user);
        }
        catch (Exception ex)
        {
            return Result.Failure<User?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByEmailAsync(string email, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(u => !u.IsDeleted && u.Email.ToLower() == email.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(u => u.Id != excludeId.Value);
            }

            var exists = await query.AnyAsync(cancellationToken);
            return Result.Success(exists);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> ExistsByPhoneNumberAsync(string phoneNumber, int? excludeId = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var query = _dbSet.Where(u => !u.IsDeleted && u.PhoneNumber == phoneNumber);

            if (excludeId.HasValue)
            {
                query = query.Where(u => u.Id != excludeId.Value);
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
