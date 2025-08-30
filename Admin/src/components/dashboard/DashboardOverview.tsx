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
} from 'lucide-react';
import { StatsCard } from './StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useDirection } from '@/contexts/DirectionContext';

const statsData = [
  {
    title: 'Total Revenue',
    titleAr: 'إجمالي الإيرادات',
    value: '$45,231.89',
    change: '+20.1% from last month',
    changeAr: '+20.1% من الشهر الماضي',
    changeType: 'positive' as const,
    icon: DollarSign,
    gradient: true,
  },
  {
    title: 'Orders',
    titleAr: 'الطلبات',
    value: '2,350',
    change: '+180 from yesterday',
    changeAr: '+180 من الأمس',
    changeType: 'positive' as const,
    icon: ShoppingCart,
  },
  {
    title: 'Products',
    titleAr: 'المنتجات',
    value: '1,234',
    change: '+12 new this week',
    changeAr: '+12 جديد هذا الأسبوع',
    changeType: 'positive' as const,
    icon: Package,
  },
  {
    title: 'Active Users',
    titleAr: 'المستخدمون النشطون',
    value: '573',
    change: '+201 since last hour',
    changeAr: '+201 منذ الساعة الماضية',
    changeType: 'positive' as const,
    icon: Users,
  },
];

const recentOrders = [
  {
    id: '#ORD-001',
    customer: 'Ahmed Hassan',
    customerAr: 'أحمد حسن',
    amount: '$250.00',
    status: 'completed',
    statusAr: 'مكتمل',
    time: '2 min ago',
    timeAr: 'منذ دقيقتين',
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Johnson',
    customerAr: 'سارة جونسون',
    amount: '$180.50',
    status: 'processing',
    statusAr: 'قيد المعالجة',
    time: '5 min ago',
    timeAr: 'منذ 5 دقائق',
  },
  {
    id: '#ORD-003',
    customer: 'Mohammed Ali',
    customerAr: 'محمد علي',
    amount: '$95.30',
    status: 'pending',
    statusAr: 'في انتظار',
    time: '10 min ago',
    timeAr: 'منذ 10 دقائق',
  },
];

const topProducts = [
  {
    name: 'Smartphone Pro Max',
    nameAr: 'هاتف ذكي برو ماكس',
    sales: 234,
    revenue: '$58,500',
    progress: 85,
  },
  {
    name: 'Wireless Headphones',
    nameAr: 'سماعات لاسلكية',
    sales: 187,
    revenue: '$37,400',
    progress: 68,
  },
  {
    name: 'Smart Watch',
    nameAr: 'ساعة ذكية',
    sales: 156,
    revenue: '$31,200',
    progress: 56,
  },
];

export const DashboardOverview: React.FC = () => {
  const { isRTL } = useDirection();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success text-success-foreground';
      case 'processing':
        return 'bg-warning text-warning-foreground';
      case 'pending':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

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
            title={isRTL ? stat.titleAr : stat.title}
            value={stat.value}
            change={isRTL ? stat.changeAr : stat.change}
            changeType={stat.changeType}
            icon={stat.icon}
            gradient={stat.gradient}
          />
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders */}
        <Card className="lg:col-span-2 border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              {isRTL ? 'الطلبات الأخيرة' : 'Recent Orders'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-smooth"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-medium">
                      {order.customer.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">
                        {isRTL ? order.customerAr : order.customer}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {isRTL ? order.timeAr : order.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{order.amount}</p>
                    <Badge className={getStatusColor(order.status)}>
                      {isRTL ? order.statusAr : order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              {isRTL ? 'أفضل المنتجات' : 'Top Products'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {topProducts.map((product, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">
                      {isRTL ? product.nameAr : product.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {product.sales} {isRTL ? 'مبيعة' : 'sold'}
                    </p>
                  </div>
                  <Progress value={product.progress} className="h-2" />
                  <p className="text-sm font-medium text-success">
                    {product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {isRTL ? 'إجراءات سريعة' : 'Quick Actions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { icon: Package, label: isRTL ? 'إضافة منتج' : 'Add Product' },
              { icon: Users, label: isRTL ? 'إدارة العملاء' : 'Manage Customers' },
              { icon: ShoppingCart, label: isRTL ? 'عرض الطلبات' : 'View Orders' },
              { icon: Eye, label: isRTL ? 'التحليلات' : 'Analytics' },
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