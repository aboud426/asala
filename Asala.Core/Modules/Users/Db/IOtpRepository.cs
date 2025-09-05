using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;

namespace Asala.Core.Modules.Users.Db;

public interface IOtpRepository : IRepository<Otp, int>
{
    Task<Result<Otp?>> GetValidOtpAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default);
    Task<Result<bool>> HasValidOtpAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default);
    Task<Result> InvalidateOtpsAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default);
    Task<Result<int>> GetAttemptsCountAsync(string phoneNumber, string purpose, DateTime since, CancellationToken cancellationToken = default);
    Task<Result> CleanupExpiredOtpsAsync(CancellationToken cancellationToken = default);
}
