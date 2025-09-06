using System.Linq.Expressions;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.DTOs;
using Asala.Core.Modules.Users.Models;

namespace Asala.UseCases.Users;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;

    public EmployeeService(
        IEmployeeRepository employeeRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork
    )
    {
        _employeeRepository =
            employeeRepository ?? throw new ArgumentNullException(nameof(employeeRepository));
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
    }

    public async Task<Result<PaginatedResult<EmployeeDto>>> GetPaginatedAsync(
        int page,
        int pageSize,
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<EmployeeDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE
            );

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<EmployeeDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        // Employee doesn't have IsActive/IsDeleted - these are in User table
        // Use repository method that joins with User table for filtering
        var result = await _employeeRepository.GetPaginatedWithUserAsync(
            page,
            pageSize,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<EmployeeDto>>(result.MessageCode);

        var employeeDtos = new List<EmployeeDto>();
        foreach (var employee in result.Value!.Items)
        {
            var dto = await MapToDtoAsync(employee, cancellationToken);
            employeeDtos.Add(dto);
        }

        var paginatedResult = new PaginatedResult<EmployeeDto>(
            employeeDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    public async Task<Result<EmployeeDto?>> GetByIdAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        if (id <= 0)
            return Result.Failure<EmployeeDto?>(MessageCodes.ENTITY_NOT_FOUND);

        var result = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (result.IsFailure)
            return Result.Failure<EmployeeDto?>(result.MessageCode);

        if (result.Value == null)
            return Result.Success<EmployeeDto?>(null);

        var dto = await MapToDtoAsync(result.Value, cancellationToken);
        return Result.Success<EmployeeDto?>(dto);
    }

    public async Task<Result<EmployeeDto?>> GetByEmailAsync(
        string email,
        CancellationToken cancellationToken = default
    )
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<EmployeeDto?>(MessageCodes.USER_EMAIL_REQUIRED);

        var userResult = await _userRepository.GetByEmailAsync(email, cancellationToken);
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Success<EmployeeDto?>(null);

        var employeeResult = await _employeeRepository.GetAsync(filter: e =>
            e.UserId == userResult.Value.Id
        );

        if (employeeResult.IsFailure)
            return Result.Failure<EmployeeDto?>(employeeResult.MessageCode);

        var employee = employeeResult.Value?.FirstOrDefault();
        if (employee == null)
            return Result.Success<EmployeeDto?>(null);

        var dto = await MapToDtoAsync(employee, cancellationToken);
        return Result.Success<EmployeeDto?>(dto);
    }

    public async Task<Result<EmployeeDto>> CreateAsync(
        CreateEmployeeDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<EmployeeDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateCreateDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<EmployeeDto>(validationResult.MessageCode);

        // Check if email already exists
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(
            createDto.Email,
            cancellationToken: cancellationToken
        );
        if (emailExistsResult.IsFailure)
            return Result.Failure<EmployeeDto>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<EmployeeDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        // Begin transaction for creating both User and Employee
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<EmployeeDto>(transactionResult.MessageCode);

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
                return Result.Failure<EmployeeDto>(addUserResult.MessageCode);
            }

            var saveUserResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(saveUserResult.MessageCode);
            }

            // Create Employee
            var employee = new Employee
            {
                UserId = addUserResult.Value!.Id,
                EmployeeName = createDto.Name.Trim(),
                // Removed: IsActive, CreatedAt, UpdatedAt (these are in User table)
            };

            var addEmployeeResult = await _employeeRepository.AddAsync(employee, cancellationToken);
            if (addEmployeeResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(addEmployeeResult.MessageCode);
            }

            var saveEmployeeResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveEmployeeResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(saveEmployeeResult.MessageCode);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(commitResult.MessageCode);
            }

            var dto = await MapToDtoAsync(addEmployeeResult.Value!, cancellationToken);
            return Result.Success(dto);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<EmployeeDto>> CreateWithoutLocationAsync(
        CreateEmployeeWithoutLocationDto createDto,
        CancellationToken cancellationToken = default
    )
    {
        if (createDto == null)
            return Result.Failure<EmployeeDto>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateCreateWithoutLocationDto(createDto);
        if (validationResult.IsFailure)
            return Result.Failure<EmployeeDto>(validationResult.MessageCode);

        // Check if email already exists
        var emailExistsResult = await _userRepository.ExistsByEmailAsync(
            createDto.Email,
            cancellationToken: cancellationToken
        );
        if (emailExistsResult.IsFailure)
            return Result.Failure<EmployeeDto>(emailExistsResult.MessageCode);

        if (emailExistsResult.Value)
            return Result.Failure<EmployeeDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);

        // Begin transaction for creating both User and Employee
        var transactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (transactionResult.IsFailure)
            return Result.Failure<EmployeeDto>(transactionResult.MessageCode);

        try
        {
            // Create User first (without LocationId)
            var user = new User
            {
                Email = createDto.Email.Trim().ToLowerInvariant(),
                PasswordHash = HashPassword(createDto.Password),
                LocationId = null, // No location
                IsActive = createDto.IsActive,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            var addUserResult = await _userRepository.AddAsync(user, cancellationToken);
            if (addUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(addUserResult.MessageCode);
            }

            var saveUserResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(saveUserResult.MessageCode);
            }

            // Create Employee
            var employee = new Employee
            {
                UserId = addUserResult.Value!.Id,
                EmployeeName = createDto.Name.Trim(),
            };

            var addEmployeeResult = await _employeeRepository.AddAsync(employee, cancellationToken);
            if (addEmployeeResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(addEmployeeResult.MessageCode);
            }

            var saveEmployeeResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveEmployeeResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(saveEmployeeResult.MessageCode);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            if (commitResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure<EmployeeDto>(commitResult.MessageCode);
            }

            var dto = await MapToDtoAsync(addEmployeeResult.Value!, cancellationToken);
            return Result.Success(dto);
        }
        catch (Exception)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            throw;
        }
    }

    public async Task<Result<EmployeeDto?>> UpdateAsync(
        int id,
        UpdateEmployeeDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (id <= 0)
            return Result.Failure<EmployeeDto?>(MessageCodes.ENTITY_NOT_FOUND);

        if (updateDto == null)
            return Result.Failure<EmployeeDto?>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateUpdateDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<EmployeeDto?>(validationResult.MessageCode);

        var employeeResult = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employeeResult.IsFailure)
            return Result.Failure<EmployeeDto?>(employeeResult.MessageCode);

        if (employeeResult.Value == null)
            return Result.Success<EmployeeDto?>(null);

        var employee = employeeResult.Value;

        // Update employee
        employee.EmployeeName = updateDto.Name.Trim();
        // Removed: IsActive, UpdatedAt (these are in User table)

        _employeeRepository.Update(employee);

        // Update associated user
        var userResult = await _userRepository.GetByIdAsync(employee.UserId, cancellationToken);
        if (userResult.IsSuccess && userResult.Value != null)
        {
            userResult.Value.Email = updateDto.Email.Trim().ToLowerInvariant();
            userResult.Value.LocationId = updateDto.LocationId;
            userResult.Value.IsActive = updateDto.IsActive;
            userResult.Value.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(userResult.Value);
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<EmployeeDto?>(saveResult.MessageCode);

        var dto = await MapToDtoAsync(employee, cancellationToken);
        return Result.Success<EmployeeDto?>(dto);
    }

    public async Task<Result<EmployeeDto?>> UpdateWithoutLocationAsync(
        int id,
        UpdateEmployeeWithoutLocationDto updateDto,
        CancellationToken cancellationToken = default
    )
    {
        if (id <= 0)
            return Result.Failure<EmployeeDto?>(MessageCodes.ENTITY_NOT_FOUND);

        if (updateDto == null)
            return Result.Failure<EmployeeDto?>(MessageCodes.ENTITY_NULL);

        var validationResult = ValidateUpdateWithoutLocationDto(updateDto);
        if (validationResult.IsFailure)
            return Result.Failure<EmployeeDto?>(validationResult.MessageCode);

        var employeeResult = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employeeResult.IsFailure)
            return Result.Failure<EmployeeDto?>(employeeResult.MessageCode);

        if (employeeResult.Value == null)
            return Result.Success<EmployeeDto?>(null);

        var employee = employeeResult.Value;

        // Update employee
        employee.EmployeeName = updateDto.Name.Trim();

        _employeeRepository.Update(employee);

        // Update associated user (without location)
        var userResult = await _userRepository.GetByIdAsync(employee.UserId, cancellationToken);
        if (userResult.IsSuccess && userResult.Value != null)
        {
            userResult.Value.Email = updateDto.Email.Trim().ToLowerInvariant();
            
            // Update password if provided
            if (!string.IsNullOrWhiteSpace(updateDto.Password))
            {
                userResult.Value.PasswordHash = HashPassword(updateDto.Password);
            }
            
            // Don't update LocationId - keep existing value
            userResult.Value.IsActive = updateDto.IsActive;
            userResult.Value.UpdatedAt = DateTime.UtcNow;
            _userRepository.Update(userResult.Value);
        }

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<EmployeeDto?>(saveResult.MessageCode);

        var dto = await MapToDtoAsync(employee, cancellationToken);
        return Result.Success<EmployeeDto?>(dto);
    }

    public async Task<Result> SoftDeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        var employeeResult = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employeeResult.IsFailure)
            return employeeResult;

        if (employeeResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);
        employeeResult.Value.IsDeleted = true;
        _employeeRepository.Update(employeeResult.Value);

        // Soft delete the associated User (which cascades to Employee)
        var userResult = await _userRepository.GetByIdAsync(
            employeeResult.Value.UserId,
            cancellationToken
        );
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        userResult.Value.IsDeleted = true;
        userResult.Value.UpdatedAt = DateTime.UtcNow;
        userResult.Value.DeletedAt = DateTime.UtcNow;

        _userRepository.Update(userResult.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result> ToggleActivationAsync(
        int id,
        CancellationToken cancellationToken = default
    )
    {
        if (id <= 0)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        var employeeResult = await _employeeRepository.GetByIdAsync(id, cancellationToken);
        if (employeeResult.IsFailure)
            return employeeResult;

        if (employeeResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        // Toggle activation on the associated User
        var userResult = await _userRepository.GetByIdAsync(
            employeeResult.Value.UserId,
            cancellationToken
        );
        if (userResult.IsFailure || userResult.Value == null)
            return Result.Failure(MessageCodes.ENTITY_NOT_FOUND);

        userResult.Value.IsActive = !userResult.Value.IsActive;
        userResult.Value.UpdatedAt = DateTime.UtcNow;

        _userRepository.Update(userResult.Value);

        return await _unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<Result<IEnumerable<EmployeeDropdownDto>>> GetDropdownAsync(
        bool activeOnly = true,
        CancellationToken cancellationToken = default
    )
    {
        // Use repository method that joins with User table for filtering
        var result = await _employeeRepository.GetPaginatedWithUserAsync(
            1,
            1000,
            activeOnly,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<IEnumerable<EmployeeDropdownDto>>(result.MessageCode);

        var dropdownDtos = new List<EmployeeDropdownDto>();
        foreach (var employee in result.Value!.Items)
        {
            var userResult = await _userRepository.GetByIdAsync(employee.UserId, cancellationToken);
            dropdownDtos.Add(
                new EmployeeDropdownDto
                {
                    UserId = employee.UserId,
                    Name = employee.EmployeeName,
                    Email =
                        userResult.IsSuccess && userResult.Value != null
                            ? userResult.Value.Email
                            : string.Empty,
                }
            );
        }

        return Result.Success<IEnumerable<EmployeeDropdownDto>>(dropdownDtos);
    }

    public async Task<Result<PaginatedResult<EmployeeDto>>> SearchByNameAsync(
        string searchTerm,
        int page = 1,
        int pageSize = 10,
        bool activeOnly = true,
        EmployeeSortBy sortBy = EmployeeSortBy.Name,
        CancellationToken cancellationToken = default
    )
    {
        if (page <= 0)
            return Result.Failure<PaginatedResult<EmployeeDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE
            );

        if (pageSize <= 0 || pageSize > 100)
            return Result.Failure<PaginatedResult<EmployeeDto>>(
                MessageCodes.PAGINATION_INVALID_PAGE_SIZE
            );

        var result = await _employeeRepository.SearchByNameAsync(
            searchTerm,
            page,
            pageSize,
            activeOnly,
            sortBy,
            cancellationToken
        );

        if (result.IsFailure)
            return Result.Failure<PaginatedResult<EmployeeDto>>(result.MessageCode);

        var employeeDtos = new List<EmployeeDto>();
        foreach (var employee in result.Value!.Items)
        {
            var dto = await MapToDtoAsync(employee, cancellationToken);
            employeeDtos.Add(dto);
        }

        var paginatedResult = new PaginatedResult<EmployeeDto>(
            employeeDtos,
            result.Value.TotalCount,
            result.Value.Page,
            result.Value.PageSize
        );

        return Result.Success(paginatedResult);
    }

    private async Task<EmployeeDto> MapToDtoAsync(
        Employee employee,
        CancellationToken cancellationToken = default
    )
    {
        // var userResult = await _userRepository.GetByIdAsync(employee.UserId, cancellationToken);

        return new EmployeeDto
        {
            UserId = employee.UserId,
            Name = employee.EmployeeName,
            Email = employee.User.Email,
            IsActive = employee.User.IsActive,
            CreatedAt = employee.User.CreatedAt,
            UpdatedAt = employee.User.UpdatedAt,
        };
    }

    private Result ValidateCreateDto(CreateEmployeeDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.EMPLOYEE_NAME_REQUIRED);

        if (string.IsNullOrWhiteSpace(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (string.IsNullOrWhiteSpace(createDto.Password))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        if (!IsValidEmail(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        if (createDto.Password.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

        return Result.Success();
    }

    private Result ValidateUpdateDto(UpdateEmployeeDto updateDto)
    {
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.EMPLOYEE_NAME_REQUIRED);

        if (string.IsNullOrWhiteSpace(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (!IsValidEmail(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        return Result.Success();
    }

    private Result ValidateCreateWithoutLocationDto(CreateEmployeeWithoutLocationDto createDto)
    {
        if (string.IsNullOrWhiteSpace(createDto.Name))
            return Result.Failure(MessageCodes.EMPLOYEE_NAME_REQUIRED);

        if (string.IsNullOrWhiteSpace(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (string.IsNullOrWhiteSpace(createDto.Password))
            return Result.Failure(MessageCodes.USER_PASSWORD_REQUIRED);

        if (!IsValidEmail(createDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        if (createDto.Password.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

        return Result.Success();
    }

    private Result ValidateUpdateWithoutLocationDto(UpdateEmployeeWithoutLocationDto updateDto)
    {
        if (string.IsNullOrWhiteSpace(updateDto.Name))
            return Result.Failure(MessageCodes.EMPLOYEE_NAME_REQUIRED);

        if (string.IsNullOrWhiteSpace(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_REQUIRED);

        if (!IsValidEmail(updateDto.Email))
            return Result.Failure(MessageCodes.USER_EMAIL_INVALID_FORMAT);

        // Validate password if provided
        if (!string.IsNullOrWhiteSpace(updateDto.Password) && updateDto.Password.Length < 6)
            return Result.Failure(MessageCodes.USER_PASSWORD_TOO_SHORT);

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
}
