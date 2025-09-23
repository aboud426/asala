using Asala.Core;
using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Users.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.CustomersApp.Identity.Register;

public class CustomerRegistrationCommand : IRequest<Result<RegisterResponseDto>>
{
    public string Email { get; set; } = null!;
    public string PhoneNumber { get; set; } = null!;
    public string Password { get; set; } = null!;
    public string Name { get; set; } = null!;
}

public class CustomerRegistrationCommandHandler
    : IRequestHandler<CustomerRegistrationCommand, Result<RegisterResponseDto>>
{
    private readonly AsalaDbContext _dbContext;

    public CustomerRegistrationCommandHandler(AsalaDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Result<RegisterResponseDto>> Handle(
        CustomerRegistrationCommand command,
        CancellationToken cancellationToken
    )
    {
        using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var otpCode = OTPGenerator.GenerateOtpCode();

            // Check for existing user
            var existingUser = await _dbContext.Users.AnyAsync(u => u.Email == command.Email);

            if (existingUser)
            {
                await transaction.RollbackAsync(cancellationToken);
                return Result.Failure<RegisterResponseDto>(MessageCodes.USER_EMAIL_ALREADY_EXISTS);
            }

            var user = new User
            {
                Email = command.Email,
                PhoneNumber = command.PhoneNumber,
                PasswordHash = SHA256PasswordHasher.Hash(command.Password),
                Name = command.Name,
                EmailConfirmed = false,
                PhoneNumberConfirmed = false,
            };

            var customer = new Customer { User = user };

            await _dbContext.Users.AddAsync(user);
            await _dbContext.Customers.AddAsync(customer);
            await _dbContext.SaveChangesAsync();

            await _dbContext.UserOtps.AddAsync(
                new UserOtps
                {
                    UserId = user.Id,
                    Otp = otpCode,
                    ExpirationTime = DateTime.UtcNow.AddMinutes(SystemSettings.OtpExpiryMinutes),
                    Purpose = OtpPurpose.Register,
                    IsUsed = false,
                    IsRevoked = false,
                }
            );
            await _dbContext.SaveChangesAsync();

            await transaction.CommitAsync(cancellationToken);
            return Result.Success<RegisterResponseDto>(
                new RegisterResponseDto { UserId = user.Id }
            );
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            return Result.Failure<RegisterResponseDto>("REGISTRATION_FAILED", ex);
        }
    }
}

public class RegisterResponseDto
{
    public int UserId { get; set; }
}
