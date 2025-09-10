using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Db;

namespace Asala.UseCases.Users;

public class AuthenticationService : IAuthenticationService
{
    private readonly IUserRepository _userRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IProviderRepository _providerRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IOtpService _otpService;
    private readonly IUnitOfWork _unitOfWork;

    public AuthenticationService(
        IUserRepository userRepository,
        ICustomerRepository customerRepository,
        IProviderRepository providerRepository,
        IEmployeeRepository employeeRepository,
        IOtpService otpService,
        IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _customerRepository = customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
        _providerRepository = providerRepository ?? throw new ArgumentNullException(nameof(providerRepository));
        _employeeRepository = employeeRepository ?? throw new ArgumentNullException(nameof(employeeRepository));
        _otpService = otpService ?? throw new ArgumentNullException(nameof(otpService));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<AuthResponseDto>> LoginCustomerAsync(
        CustomerLoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        if (loginDto == null)
            return Result.Failure<AuthResponseDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateCustomerLoginDto(loginDto);
        if (validationResult.IsFailure)
            return Result.Failure<AuthResponseDto>(validationResult.MessageCode);

        // Verify OTP first
        var otpVerifyDto = new VerifyOtpDto
        {
            PhoneNumber = loginDto.PhoneNumber,
            Code = loginDto.OtpCode,
            Purpose = "Login"
        };

        var otpResult = await _otpService.VerifyOtpAsync(otpVerifyDto, cancellationToken);
        if (otpResult.IsFailure)
            return Result.Failure<AuthResponseDto>(otpResult.MessageCode);

        if (!otpResult.Value)
            return Result.Failure<AuthResponseDto>("Invalid or expired OTP");

        // Get user by phone number
        var userResult = await _userRepository.GetByPhoneNumberAsync(loginDto.PhoneNumber, cancellationToken);
        if (userResult.IsFailure)
            return Result.Failure<AuthResponseDto>(userResult.MessageCode);

        if (userResult.Value == null)
            return Result.Failure<AuthResponseDto>("User not found");

        var user = userResult.Value;

        // Check if user is active
        if (!user.IsActive || user.IsDeleted)
            return Result.Failure<AuthResponseDto>("Account is not active");

        // Check if customer exists
        var customerResult = await _customerRepository.GetAsync(
            filter: c => c.UserId == user.Id);

        if (customerResult.IsFailure)
            return Result.Failure<AuthResponseDto>(customerResult.MessageCode);

        var customer = customerResult.Value?.FirstOrDefault();
        if (customer == null)
            return Result.Failure<AuthResponseDto>("Customer profile not found");

        // For now, return null token as requested
        var token = null as string;

        var authResponse = new AuthResponseDto
        {
            Token = token!,
            User = MapUserToDto(user),
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        return Result.Success(authResponse);
    }

    public async Task<Result<AuthResponseDto>> LoginProviderAsync(
        ProviderLoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        if (loginDto == null)
            return Result.Failure<AuthResponseDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateProviderLoginDto(loginDto);
        if (validationResult.IsFailure)
            return Result.Failure<AuthResponseDto>(validationResult.MessageCode);

        // Verify OTP first
        var otpVerifyDto = new VerifyOtpDto
        {
            PhoneNumber = loginDto.PhoneNumber,
            Code = loginDto.OtpCode,
            Purpose = "Login"
        };

        var otpResult = await _otpService.VerifyOtpAsync(otpVerifyDto, cancellationToken);
        if (otpResult.IsFailure)
            return Result.Failure<AuthResponseDto>(otpResult.MessageCode);

        if (!otpResult.Value)
            return Result.Failure<AuthResponseDto>("Invalid or expired OTP");

        // Get user by phone number
        var userResult = await _userRepository.GetByPhoneNumberAsync(loginDto.PhoneNumber, cancellationToken);
        if (userResult.IsFailure)
            return Result.Failure<AuthResponseDto>(userResult.MessageCode);

        if (userResult.Value == null)
            return Result.Failure<AuthResponseDto>("User not found");

        var user = userResult.Value;

        // Check if user is active
        if (!user.IsActive || user.IsDeleted)
            return Result.Failure<AuthResponseDto>("Account is not active");

        // Check if provider exists
        var providerResult = await _providerRepository.GetAsync(
            filter: p => p.UserId == user.Id);

        if (providerResult.IsFailure)
            return Result.Failure<AuthResponseDto>(providerResult.MessageCode);

        var provider = providerResult.Value?.FirstOrDefault();
        if (provider == null)
            return Result.Failure<AuthResponseDto>("Provider profile not found");

        // For now, return null token as requested
        var token = null as string;

        var authResponse = new AuthResponseDto
        {
            Token = token!,
            User = MapUserToDto(user),
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        return Result.Success(authResponse);
    }

    public async Task<Result<AuthResponseDto>> LoginEmployeeAsync(
        LoginDto loginDto,
        CancellationToken cancellationToken = default)
    {
        if (loginDto == null)
            return Result.Failure<AuthResponseDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateLoginDto(loginDto);
        if (validationResult.IsFailure)
            return Result.Failure<AuthResponseDto>(validationResult.MessageCode);

        // Get user by email
        var userResult = await _userRepository.GetByEmailAsync(loginDto.Email, cancellationToken);
        if (userResult.IsFailure)
            return Result.Failure<AuthResponseDto>(userResult.MessageCode);

        if (userResult.Value == null)
            return Result.Failure<AuthResponseDto>("Invalid email or password");

        var user = userResult.Value;

        // Check if user is active
        if (!user.IsActive || user.IsDeleted)
            return Result.Failure<AuthResponseDto>("Account is not active");

        // Verify password
        if (!VerifyPassword(loginDto.Password, user.PasswordHash))
            return Result.Failure<AuthResponseDto>("Invalid email or password");

        // Check if employee exists
        var employeeResult = await _employeeRepository.GetAsync(
            filter: e => e.UserId == user.Id);

        if (employeeResult.IsFailure)
            return Result.Failure<AuthResponseDto>(employeeResult.MessageCode);

        var employee = employeeResult.Value?.FirstOrDefault();
        if (employee == null)
            return Result.Failure<AuthResponseDto>("Employee profile not found");

        // For now, return null token as requested
        var token = null as string;

        var authResponse = new AuthResponseDto
        {
            Token = token!,
            User = MapUserToDto(user),
            ExpiresAt = DateTime.UtcNow.AddHours(24)
        };

        return Result.Success(authResponse);
    }

    public async Task<Result> ValidatePasswordAsync(
        int userId,
        string password,
        CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
            return Result.Failure(MessageCodes.USER_ID_INVALID);

        if (string.IsNullOrWhiteSpace(password))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        var userResult = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (userResult.IsFailure)
            return userResult;

        if (userResult.Value == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        if (!VerifyPassword(password, userResult.Value.PasswordHash))
            return Result.Failure("Invalid password");

        return Result.Success();
    }

    public async Task<Result> ChangePasswordAsync(
        int userId,
        string currentPassword,
        string newPassword,
        CancellationToken cancellationToken = default)
    {
        if (userId <= 0)
            return Result.Failure(MessageCodes.USER_ID_INVALID);

        if (string.IsNullOrWhiteSpace(currentPassword))
            return Result.Failure("Current password is required");

        if (string.IsNullOrWhiteSpace(newPassword))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        if (newPassword.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

        var userResult = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (userResult.IsFailure)
            return userResult;

        if (userResult.Value == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        var user = userResult.Value;

        // Verify current password
        if (!VerifyPassword(currentPassword, user.PasswordHash))
            return Result.Failure(MessageCodes.USER_CURRENT_PASSWORD_INVALID);

        // Update password
        user.PasswordHash = HashPassword(newPassword);
        user.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(user);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    private Result ValidateLoginDto(LoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (string.IsNullOrWhiteSpace(loginDto.Password))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        if (!IsValidEmail(loginDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        return Result.Success();
    }

    private Result ValidateCustomerLoginDto(CustomerLoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.PhoneNumber))
            return Result.Failure("Phone number is required");

        if (string.IsNullOrWhiteSpace(loginDto.OtpCode))
            return Result.Failure("OTP code is required");

        if (loginDto.OtpCode.Length != 6 || !loginDto.OtpCode.All(char.IsDigit))
            return Result.Failure("OTP code must be 6 digits");

        return Result.Success();
    }

    private Result ValidateProviderLoginDto(ProviderLoginDto loginDto)
    {
        if (string.IsNullOrWhiteSpace(loginDto.PhoneNumber))
            return Result.Failure("Phone number is required");

        if (string.IsNullOrWhiteSpace(loginDto.OtpCode))
            return Result.Failure("OTP code is required");

        if (loginDto.OtpCode.Length != 6 || !loginDto.OtpCode.All(char.IsDigit))
            return Result.Failure("OTP code must be 6 digits");

        return Result.Success();
    }

    private bool IsValidEmail(string email)
    {
        var emailRegex = new Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.IgnoreCase);
        return emailRegex.IsMatch(email);
    }

    private string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private bool VerifyPassword(string password, string hash)
    {
        var hashedPassword = HashPassword(password);
        return hashedPassword == hash;
    }

    private UserDto MapUserToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            // LocationId = user.LocationId,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }
}
