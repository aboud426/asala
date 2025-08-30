using Asala.Core.Common.Abstractions;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Db.UnitOfWork;
using Asala.Core.Modules.Languages;
using Asala.UseCases.Languages;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Asala.UseCases.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddUseCases(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        services.AddScoped<ILanguageService, LanguageService>();
        return services;
    }
}
