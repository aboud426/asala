using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Models;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Db;

namespace Asala.UseCases.Users;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UserService(IUserRepository userRepository, IUnitOfWork unitOfWork)
    {
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<UserDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<User, bool>> filter = BuildFilter(activeOnly);

        var result = await _userRepository.GetPaginatedAsync(
            page,
            pageSize,
            filter: filter,
            orderBy: q => q.OrderBy(u => u.Email)
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<UserDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<UserDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<UserDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<UserDto?>(idValidationResult.MessageCode);

        var result = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<UserDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<UserDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<UserDto?>(MessageCodes.USER_EMAIL_REQUIRED);

        var result = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<UserDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<UserDto>> CreateAsync(
        CreateUserDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateUserDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<UserDto>(validationResult.MessageCode);

        // Check if email already exists
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(createDto.Email, cancellationToken: cancellationToken);
        if (emailExistsResult.IsFailure)
            return Result.Failure<UserDto>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<UserDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        var user = new User
        {
            Email = createDto.Email.Trim().ToLowerInvariant(),
            PasswordHash = HashPassword(createDto.Password),
            LocationId = createDto.LocationId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        };

        var addResult = await _userRepository.AddAsync(user, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<UserDto>(addResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<UserDto>(saveResult.MessageCode);

        var dto = MapToDto(addResult.Value);
        return Result.Success(dto);
    }

    public async Task<Result<UserDto?>> UpdateAsync(
        int id,
        UpdateUserDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure<UserDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdateUserDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<UserDto?>(validationResult.MessageCode);

        // Check if email already exists (excluding current user)
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(updateDto.Email, id, cancellationToken);
        if (emailExistsResult.IsFailure)
            return Result.Failure<UserDto?>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<UserDto?>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        var getResult = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return Result.Failure<UserDto?>(getResult.MessageCode);

        var user = getResult.Value;
        if (user == null)
            return Result.Success<UserDto?>(null);

        user.Email = updateDto.Email.Trim().ToLowerInvariant();
        user.LocationId = updateDto.LocationId;
        user.IsActive = updateDto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(user);
        if (updateResult.IsFailure)
            return Result.Failure<UserDto?>(updateResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<UserDto?>(saveResult.MessageCode);

        var dto = MapToDto(user);
        return Result.Success<UserDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var user = getResult.Value;
        if (user == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(user);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getResult = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var user = getResult.Value;
        if (user == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(user);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ChangePasswordAsync(
        int id,
        ChangePasswordDto changePasswordDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(id);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        // Validate DTO
        var validationResult = ValidateChangePasswordDto(changePasswordDto);
        if (validationResult.IsFailure)
            return Result.Failure(validationResult.MessageCode);

        var getResult = await _userRepository.GetByIdAsync(id, cancellationToken);
        if (getResult.IsFailure)
            return getResult;

        var user = getResult.Value;
        if (user == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        // Verify current password
        if (!VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            return Result.Failure(MessageCodes.USER_CURRENT_PASSWORD_INVALID);

        user.PasswordHash = HashPassword(changePasswordDto.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(user);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<UserDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        Expression<Func<User, bool>> filter = BuildFilter(activeOnly);

        var result = await _userRepository.GetAsync(
            filter: filter,
            orderBy: q => q.OrderBy(u => u.Email)
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<UserDropdownDto>>(result.MessageCode);

        var dtos = result.Value.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<UserDropdownDto>>(dtos);
    }

    #region Private Helper Methods

    private static Expression<Func<User, bool>> BuildFilter(bool activeOnly)
    {
        return u => !u.IsDeleted && (!activeOnly || u.IsActive);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var hashedPassword = HashPassword(password);
        return hashedPassword == hash;
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.USER_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateUserDto(CreateUserDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Email
        if (string.IsNullOrWhiteSpace(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (createDto.Email.Length > 100)
            return Result.Failure(MessageCodes.USER_EMAIL_TOO_LONG);

        if (!IsValidEmail(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        // Validate Password
        if (string.IsNullOrWhiteSpace(createDto.Password))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        if (createDto.Password.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

        if (createDto.Password.Length > 100)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_LONG);

        return Result.Success();
    }

    private static Result ValidateUpdateUserDto(UpdateUserDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Email
        if (string.IsNullOrWhiteSpace(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (updateDto.Email.Length > 100)
            return Result.Failure(MessageCodes.USER_EMAIL_TOO_LONG);

        if (!IsValidEmail(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        return Result.Success();
    }

    private static Result ValidateChangePasswordDto(ChangePasswordDto changePasswordDto)
    {
        if (changePasswordDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Current Password
        if (string.IsNullOrWhiteSpace(changePasswordDto.CurrentPassword))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        // Validate New Password
        if (string.IsNullOrWhiteSpace(changePasswordDto.NewPassword))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        if (changePasswordDto.NewPassword.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

        if (changePasswordDto.NewPassword.Length > 100)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_LONG);

        return Result.Success();
    }

    private static bool IsValidEmail(string email)
    {
        const string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
    }

    #endregion

    #region Mapping Methods

    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.Id,
            Email = user.Email,
            LocationId = user.LocationId,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt,
        };
    }

    private static UserDropdownDto MapToDropdownDto(User user)
    {
        return new UserDropdownDto
        {
            Id = user.Id,
            Email = user.Email,
        };
    }

    #endregion
}
