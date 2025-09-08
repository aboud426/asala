using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class CustomerAdminService : ICustomerAdminService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CustomerAdminService(
        ICustomerRepository customerRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork
    )
    {
        _customerRepository = customerRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<CustomerDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool? activeOnly = null,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerRepository.GetPaginatedWithUserAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<CustomerDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDto);
        var paginatedDto = new PaginatedResult<CustomerDto>(
            items: dtos.ToList(),
            totalCount: result.Value.TotalCount,
            page: result.Value.Page,
            pageSize: result.Value.PageSize
        );

        return Result.Success(paginatedDto);
    }

    public async Task<Result<CustomerDto?>> GetByUserIdAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(userId);
        if (idValidationResult.IsFailure)
            return Result.Failure<CustomerDto?>(idValidationResult.MessageCode);

        var result = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CustomerDto?>(result.MessageCode);

        if (result.Value == null)
            return Result.Success<CustomerDto?>(null);

        var userResult = await _userRepository.GetByIdAsync(result.Value.UserId, cancellationToken);
        var dto = MapToDtoWithUser(result.Value, userResult.IsSuccess ? userResult.Value : null);
        return Result.Success<CustomerDto?>(dto);
    }

    public async Task<Result<CustomerDto>> CreateAsync(
        CreateCustomerAdminDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateCustomerAdminDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<CustomerDto>(validationResult.MessageCode);

        // Check if phone number already exists
        var phoneExistsResult = await _userRepository.ExistsByPhoneNumberAsync(
            createDto.PhoneNumber,
            cancellationToken: cancellationToken
        );
        if (phoneExistsResult.IsFailure)
            return Result.Failure<CustomerDto>(phoneExistsResult.MessageCode);

        if (phoneExistsResult.Value)
            return Result.Failure<CustomerDto>(MessageCodes.USER_PHONE_NUMBER_ALREADY_EXISTS);

        // Begin transaction for creating both User and Customer
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<CustomerDto>(transactionResult.MessageCode);

        try
        {
            // Create User first
            var user = new User
            {
                Email = $"customer_{createDto.PhoneNumber}@temp.com", // Temporary email since Customer uses phone
                PhoneNumber = createDto.PhoneNumber.Trim(),
                PasswordHash = null, // No password for Customer users - they use OTP
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            var addUserResult = await _userRepository.AddAsync(user, cancellationToken);
            if (addUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<CustomerDto>(addUserResult.MessageCode);
            }

            var saveUserResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<CustomerDto>(saveUserResult.MessageCode);
            }

            // Create Customer
            var customer = new Customer
            {
                UserId = addUserResult.Value.Id,
                Name = createDto.Name.Trim(),
            };

            var addCustomerResult = await _customerRepository.AddAsync(customer, cancellationToken);
            if (addCustomerResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<CustomerDto>(addCustomerResult.MessageCode);
            }

            var saveCustomerResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveCustomerResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<CustomerDto>(saveCustomerResult.MessageCode);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<CustomerDto>(commitResult.MessageCode);
            }

            var dto = MapToDtoWithUser(addCustomerResult.Value, addUserResult.Value);
            return Result.Success(dto);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<CustomerDto?>> UpdateAsync(
        int userId,
        UpdateCustomerDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate ID
        var idValidationResult = ValidateId(userId);
        if (idValidationResult.IsFailure)
            return Result.Failure<CustomerDto?>(idValidationResult.MessageCode);

        // Validate input DTO
        var validationResult = ValidateUpdateCustomerDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<CustomerDto?>(validationResult.MessageCode);

        // Get customer with user
        var getCustomerResult = await _customerRepository.GetByUserIdAsync(
            userId,
            cancellationToken
        );
        if (getCustomerResult.IsFailure)
            return Result.Failure<CustomerDto?>(getCustomerResult.MessageCode);

        var customer = getCustomerResult.Value;
        if (customer == null)
            return Result.Success<CustomerDto?>(null);

        // Get the user separately
        var getUserResult = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (getUserResult.IsFailure)
            return Result.Failure<CustomerDto?>(getUserResult.MessageCode);

        var user = getUserResult.Value;
        if (user == null)
            return Result.Success<CustomerDto?>(null);

        // Check if phone number already exists (excluding current user) - only if phone number is being updated
        if (!string.IsNullOrWhiteSpace(updateDto.PhoneNumber))
        {
            var phoneExistsResult = await _userRepository.ExistsByPhoneNumberAsync(
                updateDto.PhoneNumber,
                userId,
                cancellationToken
            );
            if (phoneExistsResult.IsFailure)
                return Result.Failure<CustomerDto?>(phoneExistsResult.MessageCode);

            if (phoneExistsResult.Value)
                return Result.Failure<CustomerDto?>(MessageCodes.USER_PHONE_NUMBER_ALREADY_EXISTS);

            // Update User phone number
            user.PhoneNumber = updateDto.PhoneNumber.Trim();
        }
        user.IsActive = updateDto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        // Update Customer
        customer.Name = updateDto.Name.Trim();

        var updateUserResult = _userRepository.Update(user);
        if (updateUserResult.IsFailure)
            return Result.Failure<CustomerDto?>(updateUserResult.MessageCode);

        var updateCustomerResult = _customerRepository.Update(customer);
        if (updateCustomerResult.IsFailure)
            return Result.Failure<CustomerDto?>(updateCustomerResult.MessageCode);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<CustomerDto?>(saveResult.MessageCode);

        var dto = MapToDtoWithUser(customer, user);
        return Result.Success<CustomerDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(userId);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getCustomerResult = await _customerRepository.GetByUserIdAsync(
            userId,
            cancellationToken
        );
        if (getCustomerResult.IsFailure)
            return getCustomerResult;

        var customer = getCustomerResult.Value;
        if (customer == null)
            return Result.Failure(MessageCodes.CUSTOMER_NOT_FOUND);

        // Get the user separately
        var getUserResult = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (getUserResult.IsFailure)
            return getUserResult;

        var user = getUserResult.Value;
        if (user == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        // Soft delete the user (which will cascade to customer via business logic)
        user.IsDeleted = true;
        user.DeletedAt = DateTime.UtcNow;
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(user);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int userId,
        CancellationToken cancellationToken = default
    )
    {
        var idValidationResult = ValidateId(userId);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getCustomerResult = await _customerRepository.GetByUserIdAsync(
            userId,
            cancellationToken
        );
        if (getCustomerResult.IsFailure)
            return getCustomerResult;

        var customer = getCustomerResult.Value;
        if (customer == null)
            return Result.Failure(MessageCodes.CUSTOMER_NOT_FOUND);

        // Get the user separately
        var getUserResult = await _userRepository.GetByIdAsync(userId, cancellationToken);
        if (getUserResult.IsFailure)
            return getUserResult;

        var user = getUserResult.Value;
        if (user == null)
            return Result.Failure(MessageCodes.USER_NOT_FOUND);

        user.IsActive = !user.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        var updateResult = _userRepository.Update(user);
        if (updateResult.IsFailure)
            return updateResult;

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<CustomerDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        var result = await _customerRepository.GetPaginatedWithUserAsync(
            1,
            1000, // Get all for dropdown
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<CustomerDropdownDto>>(result.MessageCode);

        var dtos = result.Value.Items.Select(MapToDropdownDto);
        return Result.Success<IEnumerable<CustomerDropdownDto>>(dtos);
    }

    #region Private Helper Methods

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    #endregion

    #region Validation Methods

    private static Result ValidateId(int id)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.USER_ID_INVALID);

        return Result.Success();
    }

    private static Result ValidateCreateCustomerAdminDto(CreateCustomerAdminDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.CUSTOMER_NAME_REQUIRED);

        if (createDto.Name.Length > 50)
            return Result.Failure(MessageCodes.CUSTOMER_NAME_TOO_LONG);

        // Validate Phone Number
        if (string.IsNullOrWhiteSpace(createDto.PhoneNumber))
            return Result.Failure("Phone number is required");

        if (createDto.PhoneNumber.Length > 20)
            return Result.Failure("Phone number is too long");

        return Result.Success();
    }

    private static Result ValidateUpdateCustomerDto(UpdateCustomerDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.CUSTOMER_NAME_REQUIRED);

        if (updateDto.Name.Length > 50)
            return Result.Failure(MessageCodes.CUSTOMER_NAME_TOO_LONG);

        // Validate Phone Number (optional for updates)
        if (!string.IsNullOrWhiteSpace(updateDto.PhoneNumber) && updateDto.PhoneNumber.Length > 20)
            return Result.Failure("Phone number is too long");

        return Result.Success();
    }

    private static bool IsValidEmail(string email)
    {
        const string emailPattern = @"^[^@\s]+@[^@\s]+\.[^@\s]+$";
        return Regex.IsMatch(email, emailPattern, RegexOptions.IgnoreCase);
    }

    #endregion

    #region Mapping Methods

    private static CustomerDto MapToDtoWithUser(Customer customer, User user)
    {
        return new CustomerDto
        {
            UserId = customer.UserId,
            Name = customer.Name,
            PhoneNumber = user?.PhoneNumber,
            IsActive = user?.IsActive ?? false,
            CreatedAt = user?.CreatedAt ?? DateTime.MinValue,
            UpdatedAt = user?.UpdatedAt ?? DateTime.MinValue,
        };
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            UserId = customer.UserId,
            Name = customer.Name,
            PhoneNumber = customer.User.PhoneNumber, // Will be populated by service methods when User data is available
            IsActive = customer.User.IsActive, // Will be populated by service methods when User data is available
            CreatedAt = DateTime.MinValue, // Will be populated by service methods when User data is available
            UpdatedAt = DateTime.MinValue, // Will be populated by service methods when User data is available
        };
    }

    private static CustomerDropdownDto MapToDropdownDto(Customer customer)
    {
        return new CustomerDropdownDto
        {
            UserId = customer.UserId,
            Name = customer.Name,
            Email = "", // Will be populated by service methods when User data is available
        };
    }

    #endregion
}
