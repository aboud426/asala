namespace Asala.Core.Modules.Dashboard.DTOs;

public class DashboardStatsDto
{
    public DashboardStatsOverviewDto DashboardStatsOverview { get; set; } = new();
    public List<ProductsChartByCategory> ProductsChartByCategory { get; set; } = [];
    public List<PostsChartByTypeDto> PostsChartByType { get; set; } = [];
    public List<DailyProductCountDto> DailyProductsCountInLast7Days { get; set; } = [];
    public List<DailyPostCountDto> DailyPostsCountInLast7Days { get; set; } = [];
}

public class DashboardStatsOverviewDto
{
    public int TotalCategories { get; set; }
    public int TotalProductCategories { get; set; }
    public int TotalProviders { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalEmployees { get; set; }
    public int TotalProducts { get; set; }
    public int TotalPosts { get; set; }
}

public class ProductsChartByCategory
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int ProductCount { get; set; }
}

public class PostsChartByTypeDto
{
    public int PostTypeId { get; set; }
    public string PostTypeName { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class DailyProductCountDto
{
    public DayOfWeek Day { get; set; }
    public int Count { get; set; }
}

public class DailyPostCountDto
{
    public DayOfWeek Day { get; set; }
    public int Count { get; set; }
}
