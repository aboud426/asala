import React, { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';

const ordersData = [
  {
    id: '#ORD-001',
    customer: 'Ahmed Hassan',
    customerAr: 'أحمد حسن',
    email: 'ahmed@example.com',
    total: '$250.00',
    status: 'completed',
    statusAr: 'مكتمل',
    date: '2024-01-15',
    items: 3,
  },
  {
    id: '#ORD-002',
    customer: 'Sarah Johnson',
    customerAr: 'سارة جونسون',
    email: 'sarah@example.com',
    total: '$180.50',
    status: 'processing',
    statusAr: 'قيد المعالجة',
    date: '2024-01-14',
    items: 2,
  },
  {
    id: '#ORD-003',
    customer: 'Mohammed Ali',
    customerAr: 'محمد علي',
    email: 'mohammed@example.com',
    total: '$95.30',
    status: 'pending',
    statusAr: 'في انتظار',
    date: '2024-01-14',
    items: 1,
  },
  {
    id: '#ORD-004',
    customer: 'Emma Wilson',
    customerAr: 'إيما ويلسون',
    email: 'emma@example.com',
    total: '$420.00',
    status: 'shipped',
    statusAr: 'تم الشحن',
    date: '2024-01-13',
    items: 5,
  },
  {
    id: '#ORD-005',
    customer: 'Omar Khalil',
    customerAr: 'عمر خليل',
    email: 'omar@example.com',
    total: '$75.99',
    status: 'cancelled',
    statusAr: 'ملغى',
    date: '2024-01-12',
    items: 1,
  },
];

const statusConfig = {
  completed: { 
    color: 'bg-success text-success-foreground', 
    icon: CheckCircle 
  },
  processing: { 
    color: 'bg-warning text-warning-foreground', 
    icon: Package 
  },
  pending: { 
    color: 'bg-muted text-muted-foreground', 
    icon: Clock 
  },
  shipped: { 
    color: 'bg-blue-500 text-white', 
    icon: Truck 
  },
  cancelled: { 
    color: 'bg-destructive text-destructive-foreground', 
    icon: XCircle 
  },
};

const Orders: React.FC = () => {
  const { isRTL } = useDirection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, statusAr: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {isRTL ? statusAr : status}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة الطلبات' : 'Orders Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'عرض وإدارة جميع طلبات العملاء' : 'View and manage all customer orders'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isRTL ? 'تصدير' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'البحث في الطلبات...' : 'Search orders...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    {isRTL ? 'تصفية حسب الحالة' : 'Filter by Status'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                    {isRTL ? 'جميع الطلبات' : 'All Orders'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('pending')}>
                    {isRTL ? 'في انتظار' : 'Pending'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('processing')}>
                    {isRTL ? 'قيد المعالجة' : 'Processing'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('shipped')}>
                    {isRTL ? 'تم الشحن' : 'Shipped'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('completed')}>
                    {isRTL ? 'مكتمل' : 'Completed'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('cancelled')}>
                    {isRTL ? 'ملغى' : 'Cancelled'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Orders Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredOrders.length} طلب` : `${filteredOrders.length} Orders`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'رقم الطلب' : 'Order ID'}</TableHead>
                  <TableHead>{isRTL ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead>{isRTL ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                  <TableHead>{isRTL ? 'العناصر' : 'Items'}</TableHead>
                  <TableHead>{isRTL ? 'المجموع' : 'Total'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead>{isRTL ? 'التاريخ' : 'Date'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{isRTL ? order.customerAr : order.customer}</TableCell>
                    <TableCell className="text-muted-foreground">{order.email}</TableCell>
                    <TableCell>{order.items}</TableCell>
                    <TableCell className="font-medium">{order.total}</TableCell>
                    <TableCell>{getStatusBadge(order.status, order.statusAr)}</TableCell>
                    <TableCell className="text-muted-foreground">{order.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            {isRTL ? 'عرض التفاصيل' : 'View Details'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            {isRTL ? 'تحميل الفاتورة' : 'Download Invoice'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Orders;