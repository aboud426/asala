import React from 'react';
import {
  TrendingUp,
  ShoppingCart,
  Package,
  Users,
  DollarSign,
  Activity,
  Eye,
  Clock,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDirection } from '@/contexts/DirectionContext';
import { useDashboard } from '@/hooks/useDashboard';
import { DonutChart, BarChart, LineChart } from '@/components/charts';
import type { PieChartData, BarChartData, LineChartData } from '@/components/charts';

// Define static stats configuration that will be populated with dynamic data
const statsConfig = [
  {
    key: 'totalProducts',
    title: 'Products',
    titleAr: 'المنتجات',
    icon: Package,
    gradient: true,
  },
  {
    key: 'totalCustomers',
    title: 'Customers',
    titleAr: 'العملاء',
    icon: Users,
  },
  {
    key: 'totalProviders',
    title: 'Providers',
    titleAr: 'المقدمون',
    icon: ShoppingCart,
  },
  {
    key: 'totalPosts',
    title: 'Posts',
    titleAr: 'المنشورات',
    icon: Activity,
  },
];

// Helper function to get day name
const getDayName = (dayOfWeek: number, isRTL: boolean) => {
  const daysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const daysAr = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  return isRTL ? daysAr[dayOfWeek] : daysEn[dayOfWeek];
};

export const DashboardOverview: React.FC = () => {
  const { isRTL } = useDirection();
  const { data, loading, error, refetch } = useDashboard();

  // Create stats data from API response
  const getStatsData = () => {
    if (!data?.dashboardStatsOverview) return [];

    const overview = data.dashboardStatsOverview;
    return statsConfig.map((config) => ({
      title: isRTL ? config.titleAr : config.title,
      value: overview[config.key as keyof typeof overview]?.toString() || '0',
      change: '', // API doesn't provide change data yet
      changeType: 'positive' as const,
      icon: config.icon,
      gradient: config.gradient,
    }));
  };

  // Handle loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {isRTL ? 'جاري تحميل البيانات...' : 'Loading dashboard data...'}
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <Card className="border-0 shadow-elegant">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-8 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
          </h1>
        </div>
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {isRTL ? 'خطأ في تحميل البيانات' : 'Error Loading Dashboard Data'}
            </h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              {isRTL ? 'إعادة المحاولة' : 'Try Again'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Transform products by category data for DonutChart
  const getProductsChartData = (): PieChartData[] => {
    if (!data?.productsChartByCategory?.length) return [];

    // Define a beautiful color palette for the donut chart
    const colorPalette = [
      'hsl(221, 83%, 53%)',  // Blue
      'hsl(142, 76%, 36%)',  // Green
      'hsl(262, 83%, 58%)',  // Purple
      'hsl(346, 77%, 49%)',  // Red/Pink
      'hsl(32, 95%, 44%)',   // Orange
      'hsl(191, 95%, 77%)',  // Light Blue
      'hsl(270, 95%, 77%)',  // Light Purple
      'hsl(43, 96%, 56%)',   // Yellow
      'hsl(168, 76%, 42%)',  // Teal
      'hsl(339, 82%, 52%)',  // Magenta
      'hsl(217, 91%, 60%)',  // Light Blue
      'hsl(119, 41%, 51%)',  // Forest Green
    ];

    return data.productsChartByCategory.map((category, index) => ({
      name: category.categoryName,
      value: category.productCount,
      fill: colorPalette[index % colorPalette.length],
    }));
  };

  // Transform posts by type data for BarChart
  const getPostsChartData = (): BarChartData[] => {
    if (!data?.postsChartByType?.length) return [];

    return data.postsChartByType.map((postType) => ({
      name: postType.postTypeName,
      count: postType.count,
    }));
  };


  // Transform combined daily activity data for LineChart
  const getCombinedActivityChartData = () => {
    if (!data?.dailyProductsCountInLast7Days?.length && !data?.dailyPostsCountInLast7Days?.length) return [];

    // Get all unique days
    const allDays = new Set<number>();
    data?.dailyProductsCountInLast7Days?.forEach(d => allDays.add(d.day));
    data?.dailyPostsCountInLast7Days?.forEach(d => allDays.add(d.day));

    // Create combined data for each day
    return Array.from(allDays).sort().map(dayNum => {
      const productData = data?.dailyProductsCountInLast7Days?.find(d => d.day === dayNum);
      const postData = data?.dailyPostsCountInLast7Days?.find(d => d.day === dayNum);
      return {
        day: getDayName(dayNum, isRTL),
        products: productData?.count || 0,
        posts: postData?.count || 0,
      };
    });
  };

  // Chart configurations
  const productsChartConfig = {
    value: {
      label: isRTL ? "عدد المنتجات" : "Product Count",
    },
  };

  const postsChartConfig = {
    count: {
      label: isRTL ? "عدد المنشورات" : "Post Count",
      color: "hsl(var(--primary))",
    },
  };


  const combinedActivityChartConfig = {
    products: {
      label: isRTL ? "المنتجات" : "Products",
      color: "hsl(var(--primary))",
    },
    posts: {
      label: isRTL ? "المنشورات" : "Posts", 
      color: "hsl(var(--secondary))",
    },
  };


  const statsData = getStatsData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </h1>
        <p className="text-muted-foreground">
          {isRTL
            ? 'مرحبًا بك في لوحة تحكم أسالة. إليك نظرة عامة على أداء متجرك.'
            : 'Welcome to Asala Admin. Here\'s an overview of your store performance.'
          }
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            change={stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6">
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {isRTL ? 'النشاط اليومي (آخر 7 أيام)' : 'Daily Activity (Last 7 Days)'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(data?.dailyProductsCountInLast7Days?.length || data?.dailyPostsCountInLast7Days?.length) ? (
              <div className="space-y-4">
                <LineChart
                  data={getCombinedActivityChartData()}
                  config={combinedActivityChartConfig}
                  xAxisDataKey="day"
                  lines={[
                    {
                      dataKey: 'products',
                      stroke: 'hsl(var(--primary))',
                      strokeWidth: 3,
                      type: 'monotone'
                    },
                    {
                      dataKey: 'posts',
                      stroke: 'hsl(var(--secondary))',
                      strokeWidth: 3,
                      type: 'monotone'
                    },
                  ]}
                  height={60}
                  showGrid={true}
                  showTooltip={true}
                  className="w-full h-60"
                />
                <div className="flex justify-center gap-8 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--primary))' }}></div>
                    <span>
                      {isRTL
                        ? `إجمالي المنتجات: ${data?.dailyProductsCountInLast7Days?.reduce((sum, d) => sum + d.count, 0) || 0}`
                        : `Total Products: ${data?.dailyProductsCountInLast7Days?.reduce((sum, d) => sum + d.count, 0) || 0}`
                      }
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }}></div>
                    <span>
                      {isRTL
                        ? `إجمالي المنشورات: ${data?.dailyPostsCountInLast7Days?.reduce((sum, d) => sum + d.count, 0) || 0}`
                        : `Total Posts: ${data?.dailyPostsCountInLast7Days?.reduce((sum, d) => sum + d.count, 0) || 0}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isRTL ? 'لا توجد بيانات متاحة' : 'No data available'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Products by Category */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {isRTL ? 'المنتجات حسب الفئة' : 'Products by Category'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.productsChartByCategory?.length ? (
              <div className="flex flex-col lg:flex-row gap-6 items-center">
                <div className="flex-1 w-full">
                  <DonutChart
                    data={getProductsChartData()}
                    config={productsChartConfig}
                    height={300}
                    showTooltip={true}
                    showLegend={true}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isRTL ? 'لا توجد بيانات متاحة' : 'No data available'}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Posts by Type */}
        <Card className="border-0 shadow-elegant ">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {isRTL ? 'المنشورات حسب النوع' : 'Posts by Type'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data?.postsChartByType?.length ? (
              <div className="space-y-4">
                <BarChart
                  data={getPostsChartData()}
                  config={postsChartConfig}
                  xAxisDataKey="name"
                  bars={[
                    {
                      dataKey: "count",
                      fill: "hsl(var(--primary))",
                      radius: [4, 4, 0, 0],
                    },
                  ]}
                  height={280}
                  showGrid={true}
                  showTooltip={true}
                  layout="vertical"
                  className="w-full"
                />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {isRTL
                      ? `إجمالي المنشورات: ${data.postsChartByType.reduce((sum, p) => sum + p.count, 0)}`
                      : `Total Posts: ${data.postsChartByType.reduce((sum, p) => sum + p.count, 0)}`
                    }
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {isRTL ? 'لا توجد بيانات متاحة' : 'No data available'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Quick Actions */}
      <Card className="border-0 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Package, label: isRTL ? 'إضافة منتج' : 'Add Product' },
              { icon: Users, label: isRTL ? 'إدارة العملاء' : 'Manage Customers' },
              { icon: ShoppingCart, label: isRTL ? 'عرض الطلبات' : 'View Orders' },
              { icon: Activity, label: isRTL ? 'التحليلات' : 'Analytics' },
            ].map((action, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-border hover:bg-accent hover:border-primary transition-smooth cursor-pointer hover-lift group"
              >
                <div className="flex flex-col items-center gap-3 text-center">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground flex items-center justify-center transition-smooth">
                    <action.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                  </div>
                  <p className="font-medium text-sm">{action.label}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};