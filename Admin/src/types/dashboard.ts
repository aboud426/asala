// Dashboard API response types matching C# DTOs

export interface DashboardStatsDto {
  dashboardStatsOverview: DashboardStatsOverviewDto;
  productsChartByCategory: ProductsChartByCategory[];
  postsChartByType: PostsChartByTypeDto[];
  dailyProductsCountInLast7Days: DailyProductCountDto[];
  dailyPostsCountInLast7Days: DailyPostCountDto[];
}

export interface DashboardStatsOverviewDto {
  totalCategories: number;
  totalProductCategories: number;
  totalProviders: number;
  totalCustomers: number;
  totalEmployees: number;
  totalProducts: number;
  totalPosts: number;
}

export interface ProductsChartByCategory {
  categoryId: number;
  categoryName: string;
  productCount: number;
}

export interface PostsChartByTypeDto {
  postTypeId: number;
  postTypeName: string;
  count: number;
}

export interface DailyProductCountDto {
  day: DayOfWeek;
  count: number;
}

export interface DailyPostCountDto {
  day: DayOfWeek;
  count: number;
}

// Helper enum for day of week
export enum DayOfWeek {
  Sunday = 0,
  Monday = 1,
  Tuesday = 2,
  Wednesday = 3,
  Thursday = 4,
  Friday = 5,
  Saturday = 6,
}

// API response wrapper
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  messageCode: string;
  data?: T;
}
