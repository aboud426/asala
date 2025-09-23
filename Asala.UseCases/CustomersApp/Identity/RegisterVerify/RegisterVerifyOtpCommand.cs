using Asala.Core;
using Asala.Core.Common.Jwt;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Users.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.CustomersApp.Identity.RegisterVerify;

public class RegisterVerifyOtpCommand : IRequest<Result<RegisterVerifyOtpResponseDto>>
{
    public int UserId { get; set; }
    public string OtpCode { get; set; } = null!;
}

public class RegisterVerifyOtpCommandHandler
    : IRequestHandler<RegisterVerifyOtpCommand, Result<RegisterVerifyOtpResponseDto>>
{
    private readonly AsalaDbContext _dbContext;
    private readonly JwtService _jwtService;

    public RegisterVerifyOtpCommandHandler(AsalaDbContext dbContext, JwtService jwtService)
    {
        _dbContext = dbContext;
        _jwtService = jwtService;
    }

    public async Task<Result<RegisterVerifyOtpResponseDto>> Handle(
        RegisterVerifyOtpCommand command,
        CancellationToken cancellationToken
    )
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var user = await _dbContext.Users.FindAsync(command.UserId);
            if (user == null)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure<RegisterVerifyOtpResponseDto>("USER_NOT_FOUND");
            }
            var countOfFailedLoginAttemptsInTheLastFiveMinutes = await _dbContext
                .UserFailedLoginAttempts.Where(f =>
                    f.UserId == user.Id && f.AttemptTime > DateTime.UtcNow.AddMinutes(-5)
                ) 
                .CountAsync(cancellationToken);

            if (
                countOfFailedLoginAttemptsInTheLastFiveMinutes
                >= SystemSettings.MaxFailedLoginAttemptsInTheLastFiveMinutes
            )
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure<RegisterVerifyOtpResponseDto>(
                    "TOO_MANY_FAILED_LOGIN_ATTEMPTS"
                );
            }

            var otpEntry = await _dbContext
                .UserOtps.Where(o =>
                    o.UserId == command.UserId
                    && o.Purpose == OtpPurpose.Register
                    && o.ExpirationTime > DateTime.UtcNow
                    && !o.IsUsed
                    && !o.IsRevoked
                )
                .OrderByDescending(o => o.ExpirationTime)
                .FirstOrDefaultAsync(cancellationToken);

            if (otpEntry == null || !OtpVerifier.VerifyOtpCode(command.OtpCode, otpEntry.Otp))
            {
                var failedLoginAttempt = new UserFailedLoginAttempts
                {
                    UserId = user.Id,
                    AttemptTime = DateTime.UtcNow,
                    LoginType = LoginType.Register,
                };
                _dbContext.UserFailedLoginAttempts.Add(failedLoginAttempt);
                await _dbContext.SaveChangesAsync();
                await transaction.CommitAsync(cancellationToken);
                return Result.Failure<RegisterVerifyOtpResponseDto>("INVALID_OTP");
            }

            otpEntry.IsUsed = true;
            _dbContext.UserOtps.Update(otpEntry);

            user.EmailConfirmed = true;
            _dbContext.Users.Update(user);
            await _dbContext.SaveChangesAsync();
            string tokenId = Guid.NewGuid().ToString();
            var token = _jwtService.GenerateToken(user.Id, user.Email, "Customer", tokenId);
            var expiresAt = DateTime.UtcNow.AddMinutes(SystemSettings.JwtExpiryMinutes);

            _dbContext.UserTokens.Add(
                new UserTokens
                {
                    UserId = user.Id,
                    TokenId = tokenId,
                    ExpiresAt = expiresAt,
                    IsRevoked = false,
                }
            );
            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync(cancellationToken);

            return Result.Success(new RegisterVerifyOtpResponseDto { Token = token });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure<RegisterVerifyOtpResponseDto>("OTP_VERIFICATION_FAILED", ex);
        }
    }
}

public class RegisterVerifyOtpResponseDto
{
    public string Token { get; set; } = null!;
}
