using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using Infrastructure.Interfaces;
using Infrastructure.Models;
using Infrastructure.Repository;

namespace Infrastructure.Extensions;

/// <summary>
/// Extension methods for configuring services in the DI container
/// </summary>
public static class ServiceCollectionExtensions
{
    /// <summary>
    /// Adds Infrastructure services to the DI container
    /// </summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Database context
        services.AddDbContext<TourTradeDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection")));

        // Unit of Work pattern
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Repository pattern (if you need to inject repositories directly)
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        return services;
    }

    /// <summary>
    /// Adds only the Unit of Work and Repository services (without DbContext)
    /// </summary>
    public static IServiceCollection AddRepositoryServices(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        return services;
    }
}