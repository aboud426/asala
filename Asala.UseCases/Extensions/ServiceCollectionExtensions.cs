using Asala.Core.Common.Abstractions;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Db.UnitOfWork;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Categories.Db;
using Asala.UseCases.Languages;
using Asala.UseCases.Messages;
using Asala.UseCases.Categories;
using Asala.UseCases.Users;
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
        // Language services
        services.AddScoped<ILanguageService, LanguageService>();
        services.AddScoped<IMessageService, MessageService>();
        
        // Category repositories
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ICategoryLocalizedRepository, CategoryLocalizedRepository>();
        services.AddScoped<IProductCategoryRepository, ProductCategoryRepository>();
        services.AddScoped<IProductCategoryLocalizedRepository, ProductCategoryLocalizedRepository>();
        services.AddScoped<IProviderCategoryRepository, ProviderCategoryRepository>();
        
        // Category services
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductCategoryService, ProductCategoryService>();
        services.AddScoped<IProviderCategoryService, ProviderCategoryService>();
        
        // User services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<ICustomerService, CustomerService>();
        
        return services;
    }
}
