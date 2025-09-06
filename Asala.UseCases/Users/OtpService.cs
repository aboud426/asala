using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Db.UnitOfWork;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class OtpService : IOtpService
{
    private readonly IOtpRepository _otpRepository;
    private readonly IUnitOfWork _unitOfWork;
    private const int OtpExpiryMinutes = 5;
    private const int MaxAttemptsPerHour = 5;
    private const int MaxVerificationAttempts = 3;

    public OtpService(IOtpRepository otpRepository, IUnitOfWork unitOfWork)
    {
        _otpRepository = otpRepository ?? throw new ArgumentNullException(nameof(otpRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<OtpResponseDto>> RequestOtpAsync(RequestOtpDto requestDto, CancellationToken cancellationToken = default)
    {
        if (requestDto == null)
            return Result.Failure<OtpResponseDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateRequestOtpDto(requestDto);
        if (validationResult.IsFailure)
            return Result.Failure<OtpResponseDto>(validationResult.MessageCode);

        // Check rate limiting
        var sinceTime = DateTime.UtcNow.AddHours(-1);
        var attemptsResult = await _otpRepository.GetAttemptsCountAsync(requestDto.PhoneNumber, requestDto.Purpose, sinceTime, cancellationToken);
        if (attemptsResult.IsFailure)
            return Result.Failure<OtpResponseDto>(attemptsResult.MessageCode);

        if (attemptsResult.Value >= MaxAttemptsPerHour)
            return Result.Failure<OtpResponseDto>("Too many OTP requests. Please try again later.");

        // Invalidate existing OTPs for this phone number and purpose
        var invalidateResult = await _otpRepository.InvalidateOtpsAsync(requestDto.PhoneNumber, requestDto.Purpose, cancellationToken);
        if (invalidateResult.IsFailure)
            return Result.Failure<OtpResponseDto>(invalidateResult.MessageCode);

        // Generate new OTP
        var otpCode = GenerateOtpCode();
        var expiresAt = DateTime.UtcNow.AddMinutes(OtpExpiryMinutes);

        var otp = new Otp
        {
            PhoneNumber = requestDto.PhoneNumber.Trim(),
            Code = otpCode,
            ExpiresAt = expiresAt,
            IsUsed = false,
            Purpose = requestDto.Purpose,
            AttemptsCount = 0,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var addResult = await _otpRepository.AddAsync(otp, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<OtpResponseDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<OtpResponseDto>(saveResult.MessageCode);

        // TODO: Send OTP via SMS service
        // For now, we'll just return success (in production, integrate with SMS provider)

        return Result.Success(new OtpResponseDto
        {
            Success = true,
            Message = $"OTP sent to {requestDto.PhoneNumber}",
            ExpiresAt = expiresAt
        });
    }

    public async Task<Result<bool>> VerifyOtpAsync(VerifyOtpDto verifyDto, CancellationToken cancellationToken = default)
    {
        if (verifyDto == null)
            return Result.Failure<bool>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateVerifyOtpDto(verifyDto);
        if (validationResult.IsFailure)
            return Result.Failure<bool>(validationResult.MessageCode);

        // Get valid OTP
        var otpResult = await _otpRepository.GetValidOtpAsync(verifyDto.PhoneNumber, verifyDto.Purpose, cancellationToken);
        if (otpResult.IsFailure)
            return Result.Failure<bool>(otpResult.MessageCode);

        var otp = otpResult.Value;
        if (otp == null)
            return Result.Failure<bool>("Invalid or expired OTP");

        // Check verification attempts
        if (otp.AttemptsCount >= MaxVerificationAttempts)
        {
            otp.IsUsed = true;
            otp.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Failure<bool>("Too many verification attempts. Please request a new OTP.");
        }

        // Increment attempts
        otp.AttemptsCount++;
        otp.UpdatedAt = DateTime.UtcNow;

        // Verify OTP code
        if (otp.Code != verifyDto.Code.Trim())
        {
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            return Result.Failure<bool>("Invalid OTP code");
        }

        // Mark OTP as used
        otp.IsUsed = true;
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return Result.Success(true);
    }

    public async Task<Result> InvalidateOtpsAsync(string phoneNumber, string purpose, CancellationToken cancellationToken = default)
    {
        var result = await _otpRepository.InvalidateOtpsAsync(phoneNumber, purpose, cancellationToken);
        if (result.IsFailure)
            return result;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> CleanupExpiredOtpsAsync(CancellationToken cancellationToken = default)
    {
        var result = await _otpRepository.CleanupExpiredOtpsAsync(cancellationToken);
        if (result.IsFailure)
            return result;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private static string GenerateOtpCode()
    {
        // Generate a 6-digit OTP
        var random = new Random();
        return random.Next(100000, 999999).ToString();
    }

    private static Result ValidateRequestOtpDto(RequestOtpDto requestDto)
    {
        if (string.IsNullOrWhiteSpace(requestDto.PhoneNumber))
            return Result.Failure("Phone number is required");

        if (string.IsNullOrWhiteSpace(requestDto.Purpose))
            return Result.Failure("Purpose is required");

        if (requestDto.PhoneNumber.Length > 20)
            return Result.Failure("Phone number is too long");

        if (!IsValidPurpose(requestDto.Purpose))
            return Result.Failure("Invalid purpose");

        return Result.Success();
    }

    private static Result ValidateVerifyOtpDto(VerifyOtpDto verifyDto)
    {
        if (string.IsNullOrWhiteSpace(verifyDto.PhoneNumber))
            return Result.Failure("Phone number is required");

        if (string.IsNullOrWhiteSpace(verifyDto.Code))
            return Result.Failure("OTP code is required");

        if (string.IsNullOrWhiteSpace(verifyDto.Purpose))
            return Result.Failure("Purpose is required");

        if (verifyDto.Code.Length != 6 || !verifyDto.Code.All(char.IsDigit))
            return Result.Failure("OTP code must be 6 digits");

        if (!IsValidPurpose(verifyDto.Purpose))
            return Result.Failure("Invalid purpose");

        return Result.Success();
    }

    private static bool IsValidPurpose(string purpose)
    {
        var validPurposes = new[] { "Login", "Registration" };
        return validPurposes.Contains(purpose, StringComparer.OrdinalIgnoreCase);
    }
}
