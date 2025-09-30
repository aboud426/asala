using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.ClientPages.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Locations.Db;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Shopping.Db;
using Asala.Core.Modules.Users.Db;
using Asala.UseCases.Categories;
using Asala.UseCases.ClientPages;
using Asala.UseCases.Dashboard;
using Asala.UseCases.Languages;
using Asala.UseCases.Locations;
using Asala.UseCases.Messages;
using Asala.UseCases.Posts;
using Asala.UseCases.Products;
using Asala.UseCases.Shopping;
using Asala.UseCases.Users;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Asala.UseCases.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddUseCases(
        this IServiceCollection services,
        IConfiguration configuration
    )
    {
        // Register MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));
        // Language repositories
        services.AddScoped<ILanguageRepository, LanguageRepository>();

        // Language services
        services.AddScoped<ILanguageService, LanguageService>();
        services.AddScoped<IMessageService, MessageService>();
        services.AddScoped<MessageCodesSeederService>();
        services.AddScoped<LanguageSeederService>();

        // Seeding services
        services.AddScoped<AdminEmployeeSeederService>();

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

        // ClientPages repositories
        services.AddScoped<IPostsPagesRepository, PostsPagesRepository>();
        services.AddScoped<IPostsPagesLocalizedRepository, PostsPagesLocalizedRepository>();
        services.AddScoped<IProductsPagesRepository, ProductsPagesRepository>();
        services.AddScoped<IProductsPagesLocalizedRepository, ProductsPagesLocalizedRepository>();

        // ClientPages services
        services.AddScoped<IPostsPagesService, PostsPagesService>();
        services.AddScoped<IProductsPagesService, ProductsPagesService>();

        // Posts repositories
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<IPostLocalizedRepository, PostLocalizedRepository>();
        services.AddScoped<IPostMediaRepository, PostMediaRepository>();
        services.AddScoped<IPostTypeRepository, PostTypeRepository>();

        // Posts services
        services.AddScoped<IPostService, PostService>();
        services.AddScoped<IPostTypeService, PostTypeService>();

        // Products repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IProductLocalizedRepository, ProductLocalizedRepository>();
        services.AddScoped<IProductMediaRepository, ProductMediaRepository>();
        services.AddScoped<IProductsPostRepository, ProductsPostRepository>();
        services.AddScoped<IProductAttributeAssignmentRepository, ProductAttributeAssignmentRepository>();

        // Products services
        services.AddScoped<IProductService, ProductService>();

        // User repositories
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();
        services.AddScoped<IEmployeeRepository, EmployeeRepository>();
        services.AddScoped<IProviderRepository, ProviderRepository>();
        services.AddScoped<IProviderLocalizedRepository, ProviderLocalizedRepository>();
        services.AddScoped<IProviderMediaRepository, ProviderMediaRepository>();
        services.AddScoped<IOtpRepository, OtpRepository>();
        services.AddScoped<IRoleRepository, RoleRepository>();
        services.AddScoped<IPermissionRepository, PermissionRepository>();
        services.AddScoped<ICurrencyRepository, CurrencyRepository>();
        services.AddScoped<IUserRoleRepository, UserRoleRepository>();
        services.AddScoped<IRolePermissionRepository, RolePermissionRepository>();

        // User services
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IRoleService, RoleService>();
        services.AddScoped<IPermissionService, PermissionService>();
        services.AddScoped<ICurrencyService, CurrencyService>();
        services.AddScoped<IRolePermissionService, RolePermissionService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<ICustomerAdminService, CustomerAdminService>();
        services.AddScoped<IProviderService, ProviderService>();
        services.AddScoped<IEmployeeService, EmployeeService>();
        services.AddScoped<IOtpService, OtpService>();
        services.AddScoped<IAuthenticationService, AuthenticationService>();
        services.AddScoped<IAdminService, AdminService>();

        // Shopping repositories
        services.AddScoped<ICartRepository, CartRepository>();
        services.AddScoped<ICartItemRepository, CartItemRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IOrderItemRepository, OrderItemRepository>();

        // Location repositories
        services.AddScoped<IRegionRepository, RegionRepository>();
        services.AddScoped<ILocalizedRegionRepository, LocalizedRegionRepository>();
        services.AddScoped<ILocationRepository, LocationRepository>();

        // Location services
        services.AddScoped<IRegionService, RegionService>();
        services.AddScoped<ILocationService, LocationService>();
        services.AddScoped<ILocalizedRegionRepository, LocalizedRegionRepository>();
        services.AddScoped<ILocationLocalizedRepository, LocationLocalizedRepository>();

        // Shopping services
        services.AddScoped<IOrderService, OrderService>();

        // Dashboard services
        services.AddScoped<IDashboardService, DashboardService>();

        return services;
    }
}
