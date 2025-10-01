using Asala.Core.Common.Models;
using Asala.Core.Db;
using Asala.Core.Modules.Languages;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Products.Models;
using Asala.Core.Modules.Categories.Models;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Home;

public class GetHomePageInfoQueryHandler : IRequestHandler<GetHomePageInfoQuery, Result<HomePageInfoDto>>
{
    private readonly AsalaDbContext _context;

    public GetHomePageInfoQueryHandler(AsalaDbContext context)
    {
        _context = context;
    }

    public async Task<Result<HomePageInfoDto>> Handle(
        GetHomePageInfoQuery request,
        CancellationToken cancellationToken
    )
    {
        try
        {
            // Validate language code
            var language = await ValidateAndGetLanguageAsync(request.LanguageCode, cancellationToken);
            if (language == null)
                return Result.Failure<HomePageInfoDto>(MessageCodes.LANGUAGE_NOT_FOUND);

            // Execute operations sequentially to avoid DbContext concurrency issues
            var topPosts = await GetTopArticlePostsAsync(language, cancellationToken);
            var recentProducts = await GetRecentProductsAsync(language, cancellationToken);

            var result = new HomePageInfoDto
            {
                TopPosts = topPosts,
                RecentProducts = recentProducts
            };

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            return Result.Failure<HomePageInfoDto>(MessageCodes.INTERNAL_SERVER_ERROR, ex);
        }
    }

    #region Language Validation

    /// <summary>
    /// Validates and retrieves language by code
    /// </summary>
    private async Task<Language?> ValidateAndGetLanguageAsync(string languageCode, CancellationToken cancellationToken)
    {
        return await _context.Languages
            .FirstOrDefaultAsync(l => l.Code == languageCode && l.IsActive && !l.IsDeleted, cancellationToken);
    }

    #endregion

    #region Posts Queries

    /// <summary>
    /// Gets top article posts with localization support
    /// </summary>
    private async Task<List<HomePagePostDto>> GetTopArticlePostsAsync(Language language, CancellationToken cancellationToken)
    {
        const int topPostsCount = 3;
        
        var posts = await QueryArticlePostsAsync(language, topPostsCount, cancellationToken);
        return MapPostsToHomePageDtos(posts);
    }

    /// <summary>
    /// Queries article posts from database with all necessary includes
    /// </summary>
    private async Task<List<BasePost>> QueryArticlePostsAsync(Language language, int count, CancellationToken cancellationToken)
    {
        return await _context.BasePosts
            .Include(p => p.User)
            .Include(p => p.PostMedias.Where(m => !m.IsDeleted))
            .Include(p => p.Localizations.Where(l => l.LanguageId == language.Id && l.IsActive && !l.IsDeleted))
            .Include(p => p.Article)
            .Where(p => p.IsActive && !p.IsDeleted && p.Article != null)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Maps BasePost entities to HomePagePostDto
    /// </summary>
    private static List<HomePagePostDto> MapPostsToHomePageDtos(List<BasePost> posts)
    {
        return posts.Select(post => new HomePagePostDto
        {
            PostId = post.Id,
            PostImageUrl = GetFirstImageUrl(post.PostMedias),
            Title = GetLocalizedDescription(post),
            Description = GetLocalizedDescription(post),
            PublisherName = post.User.Name
        }).ToList();
    }

    /// <summary>
    /// Gets the first image URL from post media collection
    /// </summary>
    private static string GetFirstImageUrl(IEnumerable<BasePostMedia> postMedias)
    {
        return postMedias
            .OrderBy(m => m.DisplayOrder)
            .FirstOrDefault()?.Url ?? string.Empty;
    }

    /// <summary>
    /// Gets localized description with fallback to original description
    /// </summary>
    private static string GetLocalizedDescription(BasePost post)
    {
        var localization = post.Localizations.FirstOrDefault();
        return localization?.Description ?? post.Description;
    }

    #endregion

    #region Products Queries

    /// <summary>
    /// Gets recent products with localization support
    /// </summary>
    private async Task<List<HomePageProductDto>> GetRecentProductsAsync(Language language, CancellationToken cancellationToken)
    {
        const int recentProductsCount = 8;
        
        // Execute queries sequentially to avoid DbContext concurrency issues
        var products = await QueryRecentProductsAsync(language, recentProductsCount, cancellationToken);
        var categoryLocalizations = await QueryProductCategoryLocalizationsAsync(products, language, cancellationToken);
        
        return MapProductsToHomePageDtos(products, categoryLocalizations);
    }

    /// <summary>
    /// Queries recent products from database with all necessary includes
    /// </summary>
    private async Task<List<Product>> QueryRecentProductsAsync(Language language, int count, CancellationToken cancellationToken)
    {
        return await _context.Products
            .Include(p => p.ProductCategory)
            .Include(p => p.Provider)
            .Include(p => p.ProductMedias.Where(m => !m.IsDeleted))
            .Include(p => p.ProductLocalizeds.Where(pl => pl.LanguageId == language.Id && pl.IsActive && !pl.IsDeleted))
            .Where(p => p.IsActive && !p.IsDeleted)
            .OrderByDescending(p => p.CreatedAt)
            .Take(count)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Queries product category localizations for given products
    /// </summary>
    private async Task<List<ProductCategoryLocalized>> QueryProductCategoryLocalizationsAsync(
        List<Product> products, 
        Language language, 
        CancellationToken cancellationToken)
    {
        var categoryIds = products.Select(p => p.CategoryId).Distinct().ToList();
        
        return await _context.ProductCategoryLocalizeds
            .Where(pcl => categoryIds.Contains(pcl.CategoryId) && 
                         pcl.LanguageId == language.Id && 
                         pcl.IsActive && 
                         !pcl.IsDeleted)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Maps Product entities to HomePageProductDto with category localizations
    /// </summary>
    private static List<HomePageProductDto> MapProductsToHomePageDtos(
        List<Product> products, 
        List<ProductCategoryLocalized> categoryLocalizations)
    {
        return products.Select(product => new HomePageProductDto
        {
            ProductId = product.Id,
            ProductImageUrl = GetFirstProductImageUrl(product.ProductMedias),
            ProductCategory = GetLocalizedCategoryName(product, categoryLocalizations),
            ProductName = GetLocalizedProductName(product),
            UserWhoPublishProduct = product.Provider.BusinessName,
            Price = product.Price
        }).ToList();
    }

    /// <summary>
    /// Gets the first image URL from product media collection
    /// </summary>
    private static string GetFirstProductImageUrl(IEnumerable<ProductMedia> productMedias)
    {
        return productMedias.FirstOrDefault()?.Url ?? string.Empty;
    }

    /// <summary>
    /// Gets localized product name with fallback to original name
    /// </summary>
    private static string GetLocalizedProductName(Product product)
    {
        var localization = product.ProductLocalizeds.FirstOrDefault();
        return localization?.NameLocalized ?? product.Name;
    }

    /// <summary>
    /// Gets localized category name with fallback to original name
    /// </summary>
    private static string GetLocalizedCategoryName(Product product, List<ProductCategoryLocalized> categoryLocalizations)
    {
        var categoryLocalization = categoryLocalizations.FirstOrDefault(cl => cl.CategoryId == product.CategoryId);
        return categoryLocalization?.NameLocalized ?? product.ProductCategory?.Name ?? string.Empty;
    }

    #endregion
}
