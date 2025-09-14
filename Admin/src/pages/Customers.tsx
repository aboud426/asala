import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Eye,
  Phone,
  MapPin,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import customerAdminService, {
  CustomerDto,
  CreateCustomerAdminDto,
  UpdateCustomerDto,
  CustomerSortBy,
  PaginatedResult
} from '@/services/customerAdminService';

const Customers: React.FC = () => {
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDto | null>(null);
  const [selectedCustomerForDetails, setSelectedCustomerForDetails] = useState<CustomerDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Form setup
  const createForm = useForm<CreateCustomerAdminDto>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      isActive: true,
    },
  });

  const editForm = useForm<UpdateCustomerDto>({
    defaultValues: {
      name: '',
      phoneNumber: '',
      isActive: true,
    },
  });

  // Query for customers data
  const { data: customersData, isLoading, error } = useQuery({
    queryKey: ['customers', currentPage, pageSize, statusFilter],
    queryFn: () => {
      const params: {
        page: number;
        pageSize: number;
        activeOnly?: boolean;
      } = {
        page: currentPage,
        pageSize,
      };

      // Only add activeOnly filter if not showing 'all'
      if (statusFilter === 'active') {
        params.activeOnly = true;
      } else if (statusFilter === 'inactive') {
        params.activeOnly = false;
      }

      return customerAdminService.getCustomers(params);
    },
  });

  // Query for all customers to calculate stats
  const { data: allCustomersData } = useQuery({
    queryKey: ['customers-all'],
    queryFn: () => customerAdminService.getCustomers({ pageSize: 1000 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: customerAdminService.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-all'] });
      toast.success(isRTL ? 'تم إنشاء العميل بنجاح' : 'Customer created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء العميل' : 'Error creating customer'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UpdateCustomerDto }) =>
      customerAdminService.updateCustomer(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-all'] });
      toast.success(isRTL ? 'تم تحديث العميل بنجاح' : 'Customer updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث العميل' : 'Error updating customer'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: customerAdminService.toggleCustomerActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-all'] });
      toast.success(isRTL ? 'تم تحديث حالة العميل' : 'Customer status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة العميل' : 'Error updating customer status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: customerAdminService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers-all'] });
      toast.success(isRTL ? 'تم حذف العميل بنجاح' : 'Customer deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف العميل' : 'Error deleting customer'));
    },
  });

  // Filter customers client-side for search
  const filteredCustomers = customersData?.items.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allCustomersData?.totalCount || 0,
    active: allCustomersData?.items.filter(c => c.isActive).length || 0,
    inactive: allCustomersData?.items.filter(c => !c.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateCustomerAdminDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateCustomerDto) => {
    if (!selectedCustomer) return;
    updateMutation.mutate({ userId: selectedCustomer.userId, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedCustomer(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (customer: CustomerDto) => {
    setSelectedCustomer(customer);
    editForm.reset({
      name: customer.name,
      phoneNumber: customer.phoneNumber || '',
      isActive: customer.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (customer: CustomerDto) => {
    setSelectedCustomerForDetails(customer);
    setIsDetailsDialogOpen(true);
  };

  const handleViewLocations = (customer: CustomerDto) => {
    navigate(`/locations?userId=${customer.userId}`);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive
        ? 'bg-primary/10 text-primary border border-primary/20 dark:bg-primary/20 dark:text-primary dark:border-primary/40'
        : 'bg-secondary/10 text-secondary-foreground border border-secondary/20 dark:bg-secondary/20 dark:text-secondary-foreground dark:border-secondary/40'}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${isActive
          ? 'bg-primary shadow-sm shadow-primary/50'
          : 'bg-secondary shadow-sm shadow-secondary/50'}`} />
        <span className="font-semibold">
          {isRTL ? (isActive ? 'نشط' : 'غير نشط') : (isActive ? 'Active' : 'Inactive')}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  const formatPhoneNumber = (phoneNumber?: string) => {
    if (!phoneNumber) return isRTL ? 'غير متوفر' : 'Not available';
    return phoneNumber;
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة العملاء' : 'Customer Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة العملاء وحساباتهم' : 'Manage customers and their accounts'}
            </p>
          </div>
          <Button
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة عميل جديد' : 'Add New Customer'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي العملاء' : 'Total Customers'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
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
                    {isRTL ? 'العملاء النشطون' : 'Active Customers'}
                  </p>
                  <p className="text-2xl font-bold text-success">{stats.active}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'العملاء غير النشطين' : 'Inactive Customers'}
                  </p>
                  <p className="text-2xl font-bold text-muted-foreground">{stats.inactive}</p>
                </div>
                <XCircle className="h-8 w-8 text-muted-foreground" />
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
              <div className="flex gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                    >
                      <div className={`w-2 h-2 rounded-full ${statusFilter === 'active' ? 'bg-primary' :
                        statusFilter === 'inactive' ? 'bg-secondary' :
                          'bg-gradient-to-r from-primary to-secondary'
                        }`} />
                      {isRTL ?
                        (statusFilter === 'all' ? 'جميع الحالات' : statusFilter === 'active' ? 'نشط' : 'غير نشط') :
                        (statusFilter === 'all' ? 'All Status' : statusFilter === 'active' ? 'Active' : 'Inactive')
                      }
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => setStatusFilter('all')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-500 to-red-500" />
                      {isRTL ? 'جميع الحالات' : 'All Status'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter('active')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {isRTL ? 'نشط' : 'Active'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter('inactive')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-secondary" />
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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
          <CardContent className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table dir={isRTL ? 'rtl' : 'ltr'} className={`${isRTL ? 'text-right' : 'text-left'} min-w-full`}>
                <TableHeader>
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableHead className={`text-start min-w-[200px]`}>
                      {isRTL ? 'اسم العميل' : 'Customer Name'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[200px]`}>
                      {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[200px]`}>
                      {isRTL ? 'الحالة' : 'Status'}
                    </TableHead>
                    <TableHead className={`text-start min-w-[200px]`}>
                      {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                    </TableHead>
                    <TableHead className="text-center min-w-[80px]">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    // Loading skeleton rows
                    Array.from({ length: pageSize }, (_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                            <div className="space-y-2">
                              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                              <div className="h-3 w-16 bg-muted rounded animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell><div className="h-4 w-24 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-6 w-16 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-4 w-20 bg-muted rounded animate-pulse" /></TableCell>
                        <TableCell><div className="h-8 w-8 bg-muted rounded animate-pulse" /></TableCell>
                      </TableRow>
                    ))
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <div className="text-destructive">{isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}</div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Users className="w-12 h-12 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {isRTL ? 'لا توجد عملاء متاحون' : 'No customers available'}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.userId} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0">
                              <Users className="h-4 w-4 text-primary-foreground" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm truncate max-w-[200px]">{truncateText(customer.name, 25)}</p>
                              <p className="text-xs text-muted-foreground">ID: #{customer.userId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {formatPhoneNumber(customer.phoneNumber)}
                          </div>
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          {getStatusBadge(customer.isActive)}
                        </TableCell>
                        <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(customer.createdAt)}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align={isRTL ? 'start' : 'end'}>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleShowDetails(customer)}
                              >
                                <Eye className="h-4 w-4" />
                                {isRTL ? 'عرض التفاصيل' : 'View Details'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleViewLocations(customer)}
                              >
                                <MapPin className="h-4 w-4" />
                                {isRTL ? 'عرض المواقع' : 'View Locations'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => handleEdit(customer)}
                              >
                                <Edit className="h-4 w-4" />
                                {isRTL ? 'تحرير' : 'Edit'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => toggleMutation.mutate(customer.userId)}
                              >
                                <Power className="h-4 w-4" />
                                {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                                onClick={() => deleteMutation.mutate(customer.userId)}
                              >
                                <Trash2 className="h-4 w-4" />
                                {isRTL ? 'حذف' : 'Delete'}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

          </CardContent>
        </Card>

        {/* Pagination */}
        {customersData && !isLoading && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isRTL ? 'عرض' : 'Showing'} {((currentPage - 1) * pageSize) + 1} {isRTL ? 'إلى' : 'to'} {Math.min(currentPage * pageSize, customersData.totalCount)} {isRTL ? 'من' : 'of'} {customersData.totalCount} {isRTL ? 'عميل' : 'customers'}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={!customersData.hasPreviousPage}
              >
                {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                {isRTL ? 'السابق' : 'Previous'}
              </Button>

              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">
                  {isRTL ? 'صفحة' : 'Page'} {currentPage} {isRTL ? 'من' : 'of'} {customersData.totalPages}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => prev + 1)}
                disabled={!customersData.hasNextPage}
              >
                {isRTL ? 'التالي' : 'Next'}
                {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Create Customer Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة عميل جديد' : 'Add New Customer'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات العميل الجديد' : 'Enter the details for the new customer'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم العميل مطلوب' : 'Customer name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم العميل' : 'Customer Name'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isRTL ? 'مثال: أحمد محمد' : 'e.g., John Doe'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="phoneNumber"
                  rules={{
                    required: isRTL ? 'رقم الهاتف مطلوب' : 'Phone number is required',
                    pattern: {
                      value: /^\+?[\d\s\-()]+$/,
                      message: isRTL ? 'رقم هاتف غير صحيح' : 'Invalid phone number format'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={isRTL ? 'مثال: +966501234567' : 'e.g., +1234567890'}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'العميل نشط' : 'Active Customer'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل العميل' : 'Enable or disable this customer'}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="gradient-primary" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        {isRTL ? 'جاري الإنشاء...' : 'Creating...'}
                      </div>
                    ) : (
                      isRTL ? 'إنشاء' : 'Create'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Customer Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير العميل' : 'Edit Customer'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات العميل' : 'Update the customer details'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'اسم العميل مطلوب' : 'Customer name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'اسم العميل' : 'Customer Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="phoneNumber"
                  rules={{
                    pattern: {
                      value: /^\+?[\d\s\-()]+$/,
                      message: isRTL ? 'رقم هاتف غير صحيح' : 'Invalid phone number format'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'رقم الهاتف' : 'Phone Number'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'العميل نشط' : 'Active Customer'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل العميل' : 'Enable or disable this customer'}
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="gradient-primary" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground"></div>
                        {isRTL ? 'جاري التحديث...' : 'Updating...'}
                      </div>
                    ) : (
                      isRTL ? 'حفظ التغييرات' : 'Save Changes'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Customer Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary-foreground" />
                </div>
                {isRTL ? 'تفاصيل العميل' : 'Customer Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات العميل' : 'Comprehensive view of customer information'}
              </DialogDescription>
            </DialogHeader>

            {selectedCustomerForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'اسم العميل' : 'Customer Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedCustomerForDetails.name}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'معرف المستخدم' : 'User ID'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{selectedCustomerForDetails.userId}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'رقم الهاتف' : 'Phone Number'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatPhoneNumber(selectedCustomerForDetails.phoneNumber)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedCustomerForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedCustomerForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedCustomerForDetails.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDetailsDialogOpen(false);
                  setSelectedCustomerForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedCustomerForDetails) {
                    handleEdit(selectedCustomerForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedCustomerForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير العميل' : 'Edit Customer'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Customers;