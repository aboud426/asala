using Asala.Core.Common.Abstractions;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Db.UnitOfWork;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Messages.Db;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Asala.Core.Common.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddDataAccess(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddDbContext<AsalaDbContext>(options =>
            options.UseSqlServer(configuration.GetConnectionString("DefaultConnection"), 
                b => b.MigrationsAssembly("Asala.Api"))
        );
        services.AddRepository();
        services.AddUnitOfWork();
        services.AddModuleRepositories();
        return services;
    }

    public static IServiceCollection AddRepository(this IServiceCollection services)
    {
        services.AddScoped(typeof(IRepository<,>), typeof(Repository<,>));
        return services;
    }

    public static IServiceCollection AddUnitOfWork(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        return services;
    }

    public static IServiceCollection AddModuleRepositories(this IServiceCollection services)
    {
        services.AddScoped<ILanguageRepository, LanguageRepository>();
        services.AddScoped<IMessageRepository, MessageRepository>();
        return services;
    }
}
