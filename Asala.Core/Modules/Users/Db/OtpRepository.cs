using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Modules.Users.Models;
using Microsoft.EntityFrameworkCore;

namespace Asala.Core.Modules.Users.Db;

public class OtpRepository : Repository<Otp, int>, IOtpRepository
{
    public OtpRepository(AsalaDbContext context) : base(context)
    {
    }

    public async Task<Result<Otp?>> GetValidOtpAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default)
    {
        try
        {
            var otp = await _dbSet
                .Where(o => !o.IsDeleted && o.IsActive)
                .Where(o => o.PhoneNumber == phoneNumber && o.Purpose == purpose)
                .Where(o => !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
                .OrderByDescending(o => o.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            return Result.Success(otp);
        }
        catch (Exception ex)
        {
            return Result.Failure<Otp?>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<bool>> HasValidOtpAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default)
    {
        try
        {
            var hasValidOtp = await _dbSet
                .Where(o => !o.IsDeleted && o.IsActive)
                .Where(o => o.PhoneNumber == phoneNumber && o.Purpose == purpose)
                .Where(o => !o.IsUsed && o.ExpiresAt > DateTime.UtcNow)
                .AnyAsync(cancellationToken);

            return Result.Success(hasValidOtp);
        }
        catch (Exception ex)
        {
            return Result.Failure<bool>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result> InvalidateOtpsAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default)
    {
        try
        {
            var otps = await _dbSet
                .Where(o => !o.IsDeleted)
                .Where(o => o.PhoneNumber == phoneNumber && o.Purpose == purpose)
                .Where(o => !o.IsUsed)
                .ToListAsync(cancellationToken);

            foreach (var otp in otps)
            {
                otp.IsUsed = true;
                otp.UpdatedAt = DateTime.UtcNow;
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result<int>> GetAttemptsCountAsync(string phoneNumber, string purpose, DateTime since, CancellationToken cancellationToken = default)
    {
        try
        {
            var count = await _dbSet
                .Where(o => !o.IsDeleted)
                .Where(o => o.PhoneNumber == phoneNumber && o.Purpose == purpose)
                .Where(o => o.CreatedAt >= since)
                .SumAsync(o => o.AttemptsCount, cancellationToken);

            return Result.Success(count);
        }
        catch (Exception ex)
        {
            return Result.Failure<int>(MessageCodes.DB_ERROR, ex);
        }
    }

    public async Task<Result> CleanupExpiredOtpsAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            var expiredOtps = await _dbSet
                .Where(o => !o.IsDeleted)
                .Where(o => o.ExpiresAt <= DateTime.UtcNow)
                .ToListAsync(cancellationToken);

            foreach (var otp in expiredOtps)
            {
                otp.IsDeleted = true;
                otp.UpdatedAt = DateTime.UtcNow;
                otp.DeletedAt = DateTime.UtcNow;
            }

            return Result.Success();
        }
        catch (Exception ex)
        {
            return Result.Failure(MessageCodes.DB_ERROR, ex);
        }
    }
}
