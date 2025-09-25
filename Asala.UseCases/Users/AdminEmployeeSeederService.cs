using System.Security.Cryptography;
using System.Text;
using Asala.Core.Common.Abstractions;
using Asala.Core.Common.Models;
using Asala.Core.Modules.Users.Db;
using Asala.Core.Modules.Users.Models;
using Microsoft.Extensions.Logging;

namespace Asala.UseCases.Users;

/// <summary>
/// Service for seeding admin employee user into the database on startup
/// </summary>
public class AdminEmployeeSeederService
{
    private readonly IUserRepository _userRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AdminEmployeeSeederService> _logger;

    // Admin credentials
    private const string ADMIN_EMAIL = "admin@asala.com";
    private const string ADMIN_PASSWORD = "34dfLSj45ks";
    private const string ADMIN_NAME = "مدير النظام";

    public AdminEmployeeSeederService(
        IUserRepository userRepository,
        IEmployeeRepository employeeRepository,
        IUnitOfWork unitOfWork,
        ILogger<AdminEmployeeSeederService> logger
    )
    {
        _userRepository = userRepository ?? throw new ArgumentNullException(nameof(userRepository));
        _employeeRepository =
            employeeRepository ?? throw new ArgumentNullException(nameof(employeeRepository));
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    /// <summary>
    /// Seeds admin employee user if it doesn't exist
    /// </summary>
    public async Task<Result> SeedAdminEmployeeAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _unitOfWork.BeginTransactionAsync(cancellationToken);
            _logger.LogInformation("Starting admin employee seeding process...");

            // Check if admin user already exists
            var existingUserResult = await _userRepository.GetByEmailAsync(
                ADMIN_EMAIL,
                cancellationToken
            );
            if (existingUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                _logger.LogError(
                    "Error checking existing admin user: {Error}",
                    existingUserResult.MessageCode
                );
                return existingUserResult;
            }

            if (existingUserResult.Value != null)
            {
                _logger.LogInformation("Admin user already exists, skipping seeding");
                return Result.Success();
            }

            // Create admin user
            var adminUser = new User
            {
                Name = ADMIN_NAME,
                Email = ADMIN_EMAIL,
                PasswordHash = HashPassword(ADMIN_PASSWORD),
                EmailConfirmed = true,
                PhoneNumberConfirmed = true,
                IsActive = true,
                IsDeleted = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
            };

            var createUserResult = await _userRepository.AddAsync(adminUser, cancellationToken);
            if (createUserResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                _logger.LogError(
                    "Failed to create admin user: {Error}",
                    createUserResult.MessageCode
                );
                return createUserResult;
            }

            var createdUser = createUserResult.Value;
            _logger.LogInformation("Admin user created with ID: {UserId}", createdUser.Id);

            // Create admin employee
            var adminEmployee = new Employee
            {
                UserId = createdUser.Id,
                EmployeeName = ADMIN_NAME,
                IsDeleted = false,
                User = createdUser,
            };

            var createEmployeeResult = await _employeeRepository.AddAsync(
                adminEmployee,
                cancellationToken
            );
            if (createEmployeeResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                _logger.LogError(
                    "Failed to create admin employee: {Error}",
                    createEmployeeResult.MessageCode
                );

                // Cleanup: delete the user if employee creation failed
                await _userRepository.RemoveByIdAsync(createdUser.Id, cancellationToken);
                return createEmployeeResult;
            }

            // Save changes
            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                _logger.LogError(
                    "Failed to save admin employee changes: {Error}",
                    saveResult.MessageCode
                );
                return saveResult;
            }

            _logger.LogInformation(
                "Admin employee seeding completed successfully. Email: {Email}, Name: {Name}",
                ADMIN_EMAIL,
                ADMIN_NAME
            );
            await _unitOfWork.CommitTransactionAsync(cancellationToken);
            return Result.Success();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during admin employee seeding process");
            return Result.Failure(MessageCodes.EXECUTION_ERROR);
        }
    }

    /// <summary>
    /// Hashes the password using SHA256 (same as AuthenticationService)
    /// </summary>
    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
