using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Business.Common;

/// <summary>
/// Example usage of Result pattern and PaginatedResult
/// This class demonstrates how to use the Result types in your services
/// </summary>
public class UsageExamples
{
    /// <summary>
    /// Example of a method that returns a simple Result without data
    /// </summary>
    public Result ValidateUser(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result.Failure("Email is required");

        if (!email.Contains("@"))
            return Result.Failure("Invalid email format");

        return Result.Success();
    }

    /// <summary>
    /// Example of a method that returns a Result with data
    /// </summary>
    public Result<string> ProcessUserEmail(string email)
    {
        var validationResult = ValidateUser(email);
        if (validationResult.IsFailure)
            return Result.Failure<string>(validationResult.Error);

        var processedEmail = email.ToLowerInvariant().Trim();
        return Result<string>.Success(processedEmail);
    }

    /// <summary>
    /// Example of a method that returns a paginated result
    /// </summary>
    public Result<PaginatedResult<string>> GetUsersPaginated(int page, int pageSize)
    {
        if (page < 1)
            return Result.Failure<PaginatedResult<string>>("Page must be greater than 0");

        if (pageSize < 1 || pageSize > 100)
            return Result.Failure<PaginatedResult<string>>("PageSize must be between 1 and 100");

        // Simulate getting data
        var allUsers = new List<string> { "user1@example.com", "user2@example.com", "user3@example.com" };
        var totalCount = allUsers.Count;

        var skip = (page - 1) * pageSize;
        var items = allUsers.Skip(skip).Take(pageSize).ToList();

        return PaginatedResult<string>.Create(items, totalCount, page, pageSize);
    }

    /// <summary>
    /// Example of using Result extensions for fluent operations
    /// </summary>
    public async Task<Result<string>> ProcessUserEmailWithExtensions(string email)
    {
        return await Result<string>.Success(email)
            .Map(e => e.ToLowerInvariant())
            .Map(e => e.Trim())
            .Bind(e => ValidateEmailDomain(e))
            .TapAsync(async e => await LogProcessedEmail(e))
            .OnFailureAsync(async error => await LogError(error));
    }

    /// <summary>
    /// Helper method for demonstration
    /// </summary>
    private Result<string> ValidateEmailDomain(string email)
    {
        if (email.EndsWith("@spam.com"))
            return Result.Failure<string>("Spam domains are not allowed");

        return Result<string>.Success(email);
    }

    /// <summary>
    /// Helper method for demonstration
    /// </summary>
    private Task LogProcessedEmail(string email)
    {
        // Log the processed email
        return Task.CompletedTask;
    }

    /// <summary>
    /// Helper method for demonstration
    /// </summary>
    private Task LogError(string error)
    {
        // Log the error
        return Task.CompletedTask;
    }
}