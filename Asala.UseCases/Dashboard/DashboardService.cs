using Asala.Core.Common.Models;
using Asala.Core.Modules.Categories.Db;
using Asala.Core.Modules.Dashboard.DTOs;
using Asala.Core.Modules.Posts.Db;
using Asala.Core.Modules.Posts.Models;
using Asala.Core.Modules.Products.Db;
using Asala.Core.Modules.Users.Db;
using Microsoft.EntityFrameworkCore;

namespace Asala.UseCases.Dashboard;

public class DashboardService : IDashboardService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IProductCategoryRepository _productCategoryRepository;
    private readonly IProviderRepository _providerRepository;
    private readonly ICustomerRepository _customerRepository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IProductRepository _productRepository;
    private readonly IPostRepository _postRepository;
    private readonly IPostTypeRepository _postTypeRepository;

    public DashboardService(
        ICategoryRepository categoryRepository,
        IProductCategoryRepository productCategoryRepository,
        IProviderRepository providerRepository,
        ICustomerRepository customerRepository,
        IEmployeeRepository employeeRepository,
        IProductRepository productRepository,
        IPostRepository postRepository,
        IPostTypeRepository postTypeRepository
    )
    {
        _categoryRepository =
            categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        _productCategoryRepository =
            productCategoryRepository
            ?? throw new ArgumentNullException(nameof(productCategoryRepository));
        _providerRepository =
            providerRepository ?? throw new ArgumentNullException(nameof(providerRepository));
        _customerRepository =
            customerRepository ?? throw new ArgumentNullException(nameof(customerRepository));
        _employeeRepository =
            employeeRepository ?? throw new ArgumentNullException(nameof(employeeRepository));
        _productRepository =
            productRepository ?? throw new ArgumentNullException(nameof(productRepository));
        _postRepository = postRepository ?? throw new ArgumentNullException(nameof(postRepository));
        _postTypeRepository =
            postTypeRepository ?? throw new ArgumentNullException(nameof(postTypeRepository));
    }

    public async Task<Result<DashboardStatsDto>> GetDashboardStatsAsync(
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            // Get overview statistics
            var overview = await GetDashboardOverviewAsync(cancellationToken);

            // Get chart data
            var productsByCategory = await GetProductsChartByCategoryAsync(cancellationToken);
            var postsByType = await GetPostsChartByTypeAsync(cancellationToken);

            // Get daily counts for last 7 days
            var dailyProductCounts = await GetDailyProductCountsLast7DaysAsync(cancellationToken);
            var dailyPostCounts = await GetDailyPostCountsLast7DaysAsync(cancellationToken);

            var dashboardStats = new DashboardStatsDto
            {
                DashboardStatsOverview = overview,
                ProductsChartByCategory = productsByCategory,
                PostsChartByType = postsByType,
                DailyProductsCountInLast7Days = dailyProductCounts,
                DailyPostsCountInLast7Days = dailyPostCounts,
            };

            return Result<DashboardStatsDto>.Success(dashboardStats);
        }
        catch (Exception ex)
        {
            return Result.Failure<DashboardStatsDto>("DASHBOARD_ERROR", ex);
        }
    }

    private async Task<DashboardStatsOverviewDto> GetDashboardOverviewAsync(
        CancellationToken cancellationToken
    )
    {
        var totalCategoriesResult = await _categoryRepository.CountAsync(null, cancellationToken);
        var totalProductCategoriesResult = await _productCategoryRepository.CountAsync(
            null,
            cancellationToken
        );
        var totalProvidersResult = await _providerRepository.CountAsync(null, cancellationToken);
        var totalCustomersResult = await _customerRepository.CountAsync(null, cancellationToken);
        var totalEmployeesResult = await _employeeRepository.CountAsync(null, cancellationToken);
        var totalProductsResult = await _productRepository.CountAsync(null, cancellationToken);
        var totalPostsResult = await _postRepository.CountAsync(null, cancellationToken);

        return new DashboardStatsOverviewDto
        {
            TotalCategories = totalCategoriesResult.IsSuccess ? totalCategoriesResult.Value : 0,
            TotalProductCategories = totalProductCategoriesResult.IsSuccess
                ? totalProductCategoriesResult.Value
                : 0,
            TotalProviders = totalProvidersResult.IsSuccess ? totalProvidersResult.Value : 0,
            TotalCustomers = totalCustomersResult.IsSuccess ? totalCustomersResult.Value : 0,
            TotalEmployees = totalEmployeesResult.IsSuccess ? totalEmployeesResult.Value : 0,
            TotalProducts = totalProductsResult.IsSuccess ? totalProductsResult.Value : 0,
            TotalPosts = totalPostsResult.IsSuccess ? totalPostsResult.Value : 0,
        };
    }

    private async Task<List<ProductsChartByCategory>> GetProductsChartByCategoryAsync(
        CancellationToken cancellationToken
    )
    {
        return await _productRepository
            .GetQueryable()
            .Where(p => !p.IsDeleted)
            .Include(p => p.ProductCategory)
            .GroupBy(p => new { p.ProductCategory.Id, p.ProductCategory.Name })
            .Select(g => new ProductsChartByCategory
            {
                CategoryId = g.Key.Id,
                CategoryName = g.Key.Name ?? "Unknown",
                ProductCount = g.Count(),
            })
            .OrderByDescending(x => x.ProductCount)
            .ToListAsync(cancellationToken);
    }

    private async Task<List<PostsChartByTypeDto>> GetPostsChartByTypeAsync(
        CancellationToken cancellationToken
    )
    {
        return await _postRepository
            .GetQueryable()
            .Where(p => !p.IsDeleted)
            .Include(p => p.PostType)
            .GroupBy(p => new { p.PostType.Id, p.PostType.Name })
            .Select(g => new PostsChartByTypeDto
            {
                PostTypeId = g.Key.Id,
                PostTypeName = g.Key.Name ?? "Unknown",
                Count = g.Count(),
            })
            .OrderByDescending(x => x.Count)
            .ToListAsync(cancellationToken);
    }

    private async Task<List<DailyProductCountDto>> GetDailyProductCountsLast7DaysAsync(
        CancellationToken cancellationToken
    )
    {
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-6);

        var productCounts = await _productRepository
            .GetQueryable()
            .Where(p =>
                !p.IsDeleted
                && p.CreatedAt >= startDate
                && p.CreatedAt <= endDate.AddDays(1).AddSeconds(-1)
            )
            .GroupBy(p => p.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = new List<DailyProductCountDto>();

        for (int i = 0; i < 7; i++)
        {
            var currentDate = startDate.AddDays(i);
            var count = productCounts.FirstOrDefault(pc => pc.Date == currentDate)?.Count ?? 0;

            result.Add(new DailyProductCountDto { Day = currentDate.DayOfWeek, Count = count });
        }

        return result;
    }

    private async Task<List<DailyPostCountDto>> GetDailyPostCountsLast7DaysAsync(
        CancellationToken cancellationToken
    )
    {
        var endDate = DateTime.UtcNow.Date;
        var startDate = endDate.AddDays(-6);

        var postCounts = await _postRepository
            .GetQueryable()
            .Where(p =>
                !p.IsDeleted
                && p.CreatedAt >= startDate
                && p.CreatedAt <= endDate.AddDays(1).AddSeconds(-1)
            )
            .GroupBy(p => p.CreatedAt.Date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var result = new List<DailyPostCountDto>();

        for (int i = 0; i < 7; i++)
        {
            var currentDate = startDate.AddDays(i);
            var count = postCounts.FirstOrDefault(pc => pc.Date == currentDate)?.Count ?? 0;

            result.Add(new DailyPostCountDto { Day = currentDate.DayOfWeek, Count = count });
        }

        return result;
    }
}
