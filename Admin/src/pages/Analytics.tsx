import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Calendar,
  Download,
  Eye,
  Star,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';

const revenueData = [
  { month: 'Jan', monthAr: 'يناير', revenue: 45000, orders: 234 },
  { month: 'Feb', monthAr: 'فبراير', revenue: 52000, orders: 278 },
  { month: 'Mar', monthAr: 'مارس', revenue: 48000, orders: 256 },
  { month: 'Apr', monthAr: 'أبريل', revenue: 61000, orders: 342 },
  { month: 'May', monthAr: 'مايو', revenue: 55000, orders: 298 },
  { month: 'Jun', monthAr: 'يونيو', revenue: 67000, orders: 389 },
];

const topProducts = [
  {
    name: 'Smartphone Pro Max',
    nameAr: 'هاتف ذكي برو ماكس',
    sales: 1234,
    revenue: '$123,400',
    growth: 12.5,
  },
  {
    name: 'Wireless Headphones',
    nameAr: 'سماعات لاسلكية',
    sales: 987,
    revenue: '$98,700',
    growth: 8.2,
  },
  {
    name: 'Smart Watch',
    nameAr: 'ساعة ذكية',
    sales: 756,
    revenue: '$75,600',
    growth: -2.1,
  },
  {
    name: 'Laptop Stand',
    nameAr: 'حامل لابتوب',
    sales: 654,
    revenue: '$32,700',
    growth: 15.8,
  },
];

const trafficSources = [
  {
    source: 'Organic Search',
    sourceAr: 'البحث العضوي',
    visitors: 45234,
    percentage: 42,
    change: 12.5,
  },
  {
    source: 'Social Media',
    sourceAr: 'وسائل التواصل الاجتماعي',
    visitors: 23456,
    percentage: 28,
    change: 8.2,
  },
  {
    source: 'Direct',
    sourceAr: 'مباشر',
    visitors: 18765,
    percentage: 18,
    change: -3.1,
  },
  {
    source: 'Email',
    sourceAr: 'البريد الإلكتروني',
    visitors: 12543,
    percentage: 12,
    change: 5.7,
  },
];

const Analytics: React.FC = () => {
  const { isRTL } = useDirection();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'التحليلات والتقارير' : 'Analytics & Reports'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL 
                ? 'احصل على رؤى مفصلة حول أداء متجرك' 
                : 'Get detailed insights into your store performance'
              }
            </p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="30days">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">{isRTL ? '7 أيام' : 'Last 7 days'}</SelectItem>
                <SelectItem value="30days">{isRTL ? '30 يوم' : 'Last 30 days'}</SelectItem>
                <SelectItem value="90days">{isRTL ? '90 يوم' : 'Last 90 days'}</SelectItem>
                <SelectItem value="1year">{isRTL ? 'سنة واحدة' : 'Last year'}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isRTL ? 'تصدير التقرير' : 'Export Report'}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-elegant gradient-primary text-primary-foreground">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-primary-foreground/80">
                    {isRTL ? 'إجمالي الإيرادات' : 'Total Revenue'}
                  </p>
                  <p className="text-2xl font-bold">$324,567</p>
                  <div className="flex items-center gap-1 mt-2">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+12.5%</span>
                  </div>
                </div>
                <DollarSign className="h-8 w-8 text-primary-foreground/80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي الطلبات' : 'Total Orders'}
                  </p>
                  <p className="text-2xl font-bold">2,347</p>
                  <div className="flex items-center gap-1 mt-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+8.2%</span>
                  </div>
                </div>
                <ShoppingCart className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'متوسط قيمة الطلب' : 'Average Order Value'}
                  </p>
                  <p className="text-2xl font-bold">$138.42</p>
                  <div className="flex items-center gap-1 mt-2 text-destructive">
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">-2.1%</span>
                  </div>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'معدل التحويل' : 'Conversion Rate'}
                  </p>
                  <p className="text-2xl font-bold">3.24%</p>
                  <div className="flex items-center gap-1 mt-2 text-success">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+0.5%</span>
                  </div>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                {isRTL ? 'الإيرادات الشهرية' : 'Monthly Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {revenueData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {isRTL ? data.monthAr : data.month}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-muted-foreground">
                          {data.orders} {isRTL ? 'طلب' : 'orders'}
                        </span>
                        <span className="font-medium">
                          ${data.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={(data.revenue / 70000) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Traffic Sources */}
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                {isRTL ? 'مصادر الزيارات' : 'Traffic Sources'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {trafficSources.map((source, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">
                        {isRTL ? source.sourceAr : source.source}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {source.visitors.toLocaleString()}
                        </span>
                        <span className={`text-xs flex items-center gap-1 ${
                          source.change > 0 ? 'text-success' : 'text-destructive'
                        }`}>
                          {source.change > 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {Math.abs(source.change)}%
                        </span>
                      </div>
                    </div>
                    <Progress value={source.percentage} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Top Products */}
          <Card className="lg:col-span-2 border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                {isRTL ? 'أفضل المنتجات أداءً' : 'Top Performing Products'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {isRTL ? product.nameAr : product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} {isRTL ? 'مبيعة' : 'sales'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{product.revenue}</p>
                      <div className={`flex items-center gap-1 text-sm ${
                        product.growth > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {product.growth > 0 ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {Math.abs(product.growth)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="border-0 shadow-elegant">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {isRTL ? 'إحصائيات سريعة' : 'Quick Stats'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="text-center p-4 rounded-lg bg-success/10">
                  <p className="text-2xl font-bold text-success">98.5%</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'رضا العملاء' : 'Customer Satisfaction'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/10">
                  <p className="text-2xl font-bold text-primary">2.4s</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'متوسط وقت التحميل' : 'Avg. Load Time'}
                  </p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/10">
                  <p className="text-2xl font-bold text-warning">156</p>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'عملاء جدد هذا الشهر' : 'New Customers This Month'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;