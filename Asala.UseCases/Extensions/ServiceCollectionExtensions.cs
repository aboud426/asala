using Asala.Core.Common.Abstractions;
using Asala.Core.Db;
using Asala.Core.Db.Repositories;
using Asala.Core.Db.UnitOfWork;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Products.Db;
using Asala.UseCases.Languages;
using Asala.UseCases.Messages;
using Asala.UseCases.Categories;
using Asala.UseCases.Posts;
using Asala.UseCases.Products;
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
        // Language repositories
        services.AddScoped<ILanguageRepository, LanguageRepository>();
        
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
        
        // Posts repositories
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<IPostLocalizedRepository, PostLocalizedRepository>();
        services.AddScoped<IPostMediaRepository, PostMediaRepository>();
        
        // Posts services
        services.AddScoped<IPostService, PostService>();
        
        // Products repositories
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IProductLocalizedRepository, ProductLocalizedRepository>();
        services.AddScoped<IProductMediaRepository, ProductMediaRepository>();
        services.AddScoped<IProductsPostRepository, ProductsPostRepository>();
        
        // Products services
        services.AddScoped<IProductService, ProductService>();
        
        return services;
    }
}
