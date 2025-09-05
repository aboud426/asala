using Asala.Core.Common.Abstractions;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Db.UnitOfWork;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Languages;
using Asala.UseCases.Categories;
using Asala.UseCases.Languages;
using Asala.UseCases.Messages;
using Asala.UseCases.Categories;
using Asala.UseCases.Users;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Asala.Core.Modules.Users.Db;

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
        services.AddScoped<MessageCodesSeederService>();

        // Category repositories
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<ICategoryLocalizedRepository, CategoryLocalizedRepository>();
        services.AddScoped<IProductCategoryRepository, ProductCategoryRepository>();
        services.AddScoped<
            IProductCategoryLocalizedRepository,
            ProductCategoryLocalizedRepository
        >();
        services.AddScoped<IProviderCategoryRepository, ProviderCategoryRepository>();

        // Category services
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IProductCategoryService, ProductCategoryService>();
        services.AddScoped<IProviderCategoryService, ProviderCategoryService>();
        
        // User repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IProviderRepository, ProviderRepository>();
        services.AddScoped<IProviderLocalizedRepository, ProviderLocalizedRepository>();
        services.AddScoped<IOtpRepository, OtpRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();
        
        // User services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IProviderService, ProviderService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IOtpService, OtpService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        

        return services;
    }
}
