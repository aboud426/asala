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
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  MoreHorizontal,
  Users,
  UserPlus,
  Star,
  ShoppingBag,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';

const customersData = [
  {
    id: 'CUST-001',
    name: 'Ahmed Hassan',
    nameAr: 'أحمد حسن',
    email: 'ahmed@example.com',
    phone: '+966 50 123 4567',
    location: 'Riyadh, Saudi Arabia',
    locationAr: 'الرياض، السعودية',
    totalOrders: 12,
    totalSpent: '$2,340.50',
    status: 'active',
    statusAr: 'نشط',
    joinDate: '2023-06-15',
    lastOrder: '2024-01-10',
  },
  {
    id: 'CUST-002',
    name: 'Sarah Johnson',
    nameAr: 'سارة جونسون',
    email: 'sarah@example.com',
    phone: '+1 555 234 5678',
    location: 'New York, USA',
    locationAr: 'نيويورك، الولايات المتحدة',
    totalOrders: 8,
    totalSpent: '$1,890.00',
    status: 'active',
    statusAr: 'نشط',
    joinDate: '2023-08-22',
    lastOrder: '2024-01-08',
  },
  {
    id: 'CUST-003',
    name: 'Mohammed Ali',
    nameAr: 'محمد علي',
    email: 'mohammed@example.com',
    phone: '+971 50 987 6543',
    location: 'Dubai, UAE',
    locationAr: 'دبي، الإمارات',
    totalOrders: 15,
    totalSpent: '$3,250.75',
    status: 'vip',
    statusAr: 'مميز',
    joinDate: '2023-03-10',
    lastOrder: '2024-01-12',
  },
  {
    id: 'CUST-004',
    name: 'Emma Wilson',
    nameAr: 'إيما ويلسون',
    email: 'emma@example.com',
    phone: '+44 20 7946 0958',
    location: 'London, UK',
    locationAr: 'لندن، المملكة المتحدة',
    totalOrders: 3,
    totalSpent: '$450.25',
    status: 'inactive',
    statusAr: 'غير نشط',
    joinDate: '2023-11-05',
    lastOrder: '2023-12-20',
  },
  {
    id: 'CUST-005',
    name: 'Omar Khalil',
    nameAr: 'عمر خليل',
    email: 'omar@example.com',
    phone: '+20 10 123 4567',
    location: 'Cairo, Egypt',
    locationAr: 'القاهرة، مصر',
    totalOrders: 7,
    totalSpent: '$1,120.90',
    status: 'active',
    statusAr: 'نشط',
    joinDate: '2023-09-18',
    lastOrder: '2024-01-05',
  },
];

const statusConfig = {
  active: { 
    color: 'bg-success text-success-foreground', 
    icon: Users 
  },
  inactive: { 
    color: 'bg-muted text-muted-foreground', 
    icon: Users 
  },
  vip: { 
    color: 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white', 
    icon: Star 
  },
};

const Customers: React.FC = () => {
  const { isRTL } = useDirection();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredCustomers = customersData.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string, statusAr: string) => {
    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;
    
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {isRTL ? statusAr : status.toUpperCase()}
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
              {isRTL ? 'إدارة العملاء' : 'Customers Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة ملفات العملاء ونشاطهم' : 'Manage customer profiles and activity'}
            </p>
          </div>
          <Button className="gradient-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة عميل جديد' : 'Add New Customer'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي العملاء' : 'Total Customers'}
                  </p>
                  <p className="text-2xl font-bold">2,847</p>
                </div>
                <Users className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'عملاء نشطون' : 'Active Customers'}
                  </p>
                  <p className="text-2xl font-bold text-success">2,234</p>
                </div>
                <UserPlus className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'عملاء مميزون' : 'VIP Customers'}
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">89</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'عملاء جدد' : 'New This Month'}
                  </p>
                  <p className="text-2xl font-bold text-primary">156</p>
                </div>
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
                <Input
                  placeholder={isRTL ? 'البحث في العملاء...' : 'Search customers...'}
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
                    {isRTL ? 'جميع العملاء' : 'All Customers'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                    {isRTL ? 'نشط' : 'Active'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                    {isRTL ? 'غير نشط' : 'Inactive'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter('vip')}>
                    {isRTL ? 'مميز' : 'VIP'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>

        {/* Customers Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredCustomers.length} عميل` : `${filteredCustomers.length} Customers`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isRTL ? 'العميل' : 'Customer'}</TableHead>
                  <TableHead>{isRTL ? 'الموقع' : 'Location'}</TableHead>
                  <TableHead>{isRTL ? 'الطلبات' : 'Orders'}</TableHead>
                  <TableHead>{isRTL ? 'إجمالي الإنفاق' : 'Total Spent'}</TableHead>
                  <TableHead>{isRTL ? 'آخر طلب' : 'Last Order'}</TableHead>
                  <TableHead>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center font-medium">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{isRTL ? customer.nameAr : customer.name}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {customer.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{isRTL ? customer.locationAr : customer.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{customer.totalOrders}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-success">{customer.totalSpent}</TableCell>
                    <TableCell className="text-muted-foreground">{customer.lastOrder}</TableCell>
                    <TableCell>{getStatusBadge(customer.status, customer.statusAr)}</TableCell>
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
                            {isRTL ? 'عرض الملف الشخصي' : 'View Profile'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Edit className="h-4 w-4" />
                            {isRTL ? 'تحرير' : 'Edit'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {isRTL ? 'إرسال بريد إلكتروني' : 'Send Email'}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <ShoppingBag className="h-4 w-4" />
                            {isRTL ? 'عرض الطلبات' : 'View Orders'}
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

export default Customers;