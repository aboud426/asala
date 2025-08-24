using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Infrastructure.Common;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Business.Common;
using Microsoft.Extensions.Caching.Memory;

namespace Business.Services;

/// <summary>
/// Example service demonstrating Unit of Work usage
/// </summary>
public interface IUserService
{
    Task<Result<User?>> GetUserByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<Result<PaginatedResult<User>>> GetUsersAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Result<User>> CreateUserAsync(string email, string passwordHash, int? locationId = null, CancellationToken cancellationToken = default);
    Task<Result> UpdateUserAsync(User user, CancellationToken cancellationToken = default);
    Task<Result> DeleteUserAsync(int id, CancellationToken cancellationToken = default);
}

public class UserService : IUserService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMemoryCache _cache;

    public UserService(IUnitOfWork unitOfWork, IMemoryCache cache)
    {
        _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
        _cache = cache ?? throw new ArgumentNullException(nameof(cache));
    }

    public async Task<Result<User?>> GetUserByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure<User?>("Invalid user ID");

        // Cache-aside pattern: Check cache first
        return await _cache.GetOrSetAsync(
            CacheKeys.User(id),
            async () => await _unitOfWork.Users.GetByIdAsync(id, cancellationToken),
            CacheHelper.ExpirationTimes.Medium
        );
    }

    public async Task<Result<PaginatedResult<User>>> GetUsersAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _unitOfWork.Users.GetPaginatedAsync(
            page, 
            pageSize, 
            orderBy: query => query.OrderBy(u => u.Email),
            includeProperties: "Location",
            cancellationToken: cancellationToken);
    }

    public async Task<Result<User>> CreateUserAsync(string email, string passwordHash, int? locationId = null, CancellationToken cancellationToken = default)
    {
        // Validation
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure<User>("Email is required");

        if (string.IsNullOrWhiteSpace(passwordHash))
            return Result.Failure<User>("Password hash is required");

        // Check if user already exists
        var existingUserResult = await _unitOfWork.Users.GetFirstOrDefaultAsync(
            u => u.Email == email, 
            cancellationToken: cancellationToken);

        if (existingUserResult.IsFailure)
            return Result.Failure<User>(existingUserResult.Error);

        if (existingUserResult.Value != null)
            return Result.Failure<User>("User with this email already exists");

        // Validate location if provided
        if (locationId.HasValue)
        {
            var locationExistsResult = await _unitOfWork.Locations.AnyAsync(
                l => l.Id == locationId.Value, 
                cancellationToken);

            if (locationExistsResult.IsFailure)
                return Result.Failure<User>(locationExistsResult.Error);

            if (!locationExistsResult.Value)
                return Result.Failure<User>("Invalid location ID");
        }

        // Create user
        var user = new User
        {
            Email = email.ToLowerInvariant().Trim(),
            PasswordHash = passwordHash,
            LocationId = locationId
        };

        var addResult = await _unitOfWork.Users.AddAsync(user, cancellationToken);
        if (addResult.IsFailure)
            return Result.Failure<User>(addResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        if (saveResult.IsFailure)
            return Result.Failure<User>(saveResult.Error);

        // Cache invalidation: Clear related cache entries
        _cache.Remove(CacheKeys.ALL_USERS);

        return Result<User>.Success(addResult.Value!);
    }

    public async Task<Result> UpdateUserAsync(User user, CancellationToken cancellationToken = default)
    {
        if (user == null)
            return Result.Failure("User cannot be null");

        // Validate that user exists
        var existingUserResult = await _unitOfWork.Users.GetByIdAsync(user.Id, cancellationToken);
        if (existingUserResult.IsFailure)
            return Result.Failure(existingUserResult.Error);

        if (existingUserResult.Value == null)
            return Result.Failure("User not found");

        // Validate location if provided
        if (user.LocationId.HasValue)
        {
            var locationExistsResult = await _unitOfWork.Locations.AnyAsync(
                l => l.Id == user.LocationId.Value, 
                cancellationToken);

            if (locationExistsResult.IsFailure)
                return Result.Failure(locationExistsResult.Error);

            if (!locationExistsResult.Value)
                return Result.Failure("Invalid location ID");
        }

        var updateResult = _unitOfWork.Users.Update(user);
        if (updateResult.IsFailure)
            return Result.Failure(updateResult.Error);

        var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        if (saveResult.IsSuccess)
        {
            // Cache invalidation
            _cache.Remove(CacheKeys.User(user.Id));
            _cache.Remove(CacheKeys.ALL_USERS);
        }

        return saveResult.IsFailure ? Result.Failure(saveResult.Error) : Result.Success();
    }

    public async Task<Result> DeleteUserAsync(int id, CancellationToken cancellationToken = default)
    {
        if (id <= 0)
            return Result.Failure("Invalid user ID");

        // Begin transaction for complex deletion
        var beginTransactionResult = await _unitOfWork.BeginTransactionAsync(cancellationToken);
        if (beginTransactionResult.IsFailure)
            return Result.Failure(beginTransactionResult.Error);

        try
        {
            // Check if user exists
            var userResult = await _unitOfWork.Users.GetByIdAsync(id, cancellationToken);
            if (userResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure(userResult.Error);
            }

            if (userResult.Value == null)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure("User not found");
            }

            // Check for dependencies (orders, posts, etc.)
            var hasOrdersResult = await _unitOfWork.Orders.AnyAsync(o => o.UserId == id, cancellationToken);
            if (hasOrdersResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure(hasOrdersResult.Error);
            }

            if (hasOrdersResult.Value)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure("Cannot delete user with existing orders");
            }

            // Remove user
            var removeResult = await _unitOfWork.Users.RemoveByIdAsync(id, cancellationToken);
            if (removeResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure(removeResult.Error);
            }

            var saveResult = await _unitOfWork.SaveChangesAsync(cancellationToken);
            if (saveResult.IsFailure)
            {
                await _unitOfWork.RollbackTransactionAsync(cancellationToken);
                return Result.Failure(saveResult.Error);
            }

            var commitResult = await _unitOfWork.CommitTransactionAsync(cancellationToken);
            
            if (commitResult.IsSuccess)
            {
                // Cache invalidation
                _cache.Remove(CacheKeys.User(id));
                _cache.Remove(CacheKeys.ALL_USERS);
            }
            
            return commitResult.IsFailure ? Result.Failure(commitResult.Error) : Result.Success();
        }
        catch (System.Exception ex)
        {
            await _unitOfWork.RollbackTransactionAsync(cancellationToken);
            return Result.Failure($"Error deleting user: {ex.Message}");
        }
    }
}