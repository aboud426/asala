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

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public CustomerService(
        ICustomerRepository customerRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork)
    {
        _customerRepository = customerRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<Result<PaginatedResult<CustomerDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
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

    public async Task<Result<CustomerDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<CustomerDto?>(MessageCodes.USER_EMAIL_REQUIRED);

        var result = await _customerRepository.GetByEmailAsync(email, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<CustomerDto?>(result.MessageCode);

        var dto = result.Value != null ? MapToDto(result.Value) : null;
        return Result.Success(dto);
    }

    public async Task<Result<CustomerDto>> CreateAsync(
        CreateCustomerDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        // Validate input DTO
        var validationResult = ValidateCreateCustomerDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<CustomerDto>(validationResult.MessageCode);

        // Check if email already exists
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(createDto.Email, cancellationToken: cancellationToken);
        if (emailExistsResult.IsFailure)
            return Result.Failure<CustomerDto>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<CustomerDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        // Begin transaction for creating both User and Customer
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<CustomerDto>(transactionResult.MessageCode);

        try
        {
            // Create User first
            var user = new User
            {
                Email = createDto.Email.Trim().ToLowerInvariant(),
                PasswordHash = HashPassword(createDto.Password),
                LocationId = createDto.LocationId,
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
                AddressId = null // Address can be set later
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
        var getCustomerResult = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
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

        // Check if email already exists (excluding current user)
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(updateDto.Email, userId, cancellationToken);
        if (emailExistsResult.IsFailure)
            return Result.Failure<CustomerDto?>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<CustomerDto?>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        // Update User
        user.Email = updateDto.Email.Trim().ToLowerInvariant();
        user.IsActive = updateDto.IsActive;
        user.UpdatedAt = DateTime.UtcNow;

        // Update Customer
        customer.Name = updateDto.Name.Trim();
        customer.AddressId = updateDto.AddressId;

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

    public async Task<Result> SoftDeleteAsync(int userId, CancellationToken cancellationToken = default)
    {
        var idValidationResult = ValidateId(userId);
        if (idValidationResult.IsFailure)
            return Result.Failure(idValidationResult.MessageCode);

        var getCustomerResult = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
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

        var getCustomerResult = await _customerRepository.GetByUserIdAsync(userId, cancellationToken);
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

    public async Task<Result<PaginatedResult<CustomerDto>>> SearchByNameAsync(
        string searchTerm,
        int page = 1,
        int pageSize = 10,
        bool activeOnly = true,
        CustomerSortBy sortBy = CustomerSortBy.Name,
        CancellationToken cancellationToken = default)
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<CustomerDto>>(MessageCodes.PAGINATION_INVALID_PAGE);

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<CustomerDto>>(MessageCodes.PAGINATION_INVALID_PAGE_SIZE);

        var result = await _customerRepository.SearchByNameAsync(
            searchTerm,
            page,
            pageSize,
            activeOnly,
            sortBy,
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

    private static Result ValidateCreateCustomerDto(CreateCustomerDto createDto)
    {
        if (createDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.CUSTOMER_NAME_REQUIRED);

        if (createDto.Name.Length > 50)
            return Result.Failure(MessageCodes.CUSTOMER_NAME_TOO_LONG);

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

    private static Result ValidateUpdateCustomerDto(UpdateCustomerDto updateDto)
    {
        if (updateDto == null)
            return Result.Failure(MessageCodes.ENTITY_NULL);

        // Validate Name
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.CUSTOMER_NAME_REQUIRED);

        if (updateDto.Name.Length > 50)
            return Result.Failure(MessageCodes.CUSTOMER_NAME_TOO_LONG);

        // Validate Email
        if (string.IsNullOrWhiteSpace(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (updateDto.Email.Length > 100)
            return Result.Failure(MessageCodes.USER_EMAIL_TOO_LONG);

        if (!IsValidEmail(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        // Validate Address ID
        if (updateDto.AddressId <= 0)
            return Result.Failure(MessageCodes.CUSTOMER_ADDRESS_ID_INVALID);

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
            AddressId = customer.AddressId,
            Email = user?.Email ?? "",
            IsActive = user?.IsActive ?? false,
            CreatedAt = user?.CreatedAt ?? DateTime.MinValue,
        };
    }

    private static CustomerDto MapToDto(Customer customer)
    {
        return new CustomerDto
        {
            UserId = customer.UserId,
            Name = customer.Name,
            AddressId = customer.AddressId,
            Email = "", // Will be populated by service methods when User data is available
            IsActive = true, // Will be populated by service methods when User data is available
            CreatedAt = DateTime.MinValue, // Will be populated by service methods when User data is available
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
