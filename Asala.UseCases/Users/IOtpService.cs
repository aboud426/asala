using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.DTOs;

namespace Asala.UseCases.Users;

public interface IOtpService
{
    Task<Result<OtpResponseDto>> RequestOtpAsync(RequestOtpDto requestDto, CancellationToken cancellationToken = default);
    Task<Result<bool>> VerifyOtpAsync(VerifyOtpDto verifyDto, CancellationToken cancellationToken = default);
    Task<Result> InvalidateOtpsAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default);
    Task<Result> CleanupExpiredOtpsAsync(CancellationToken cancellationToken = default);
}
