import React, { useState, useEffect } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Users,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  User,
  Mail,
  Eye,
  Calendar,
  Shield,
  UserPlus,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import employeeService, {
  EmployeeDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  EmployeeSortBy,
  PaginatedResult
} from '@/services/employeeService';

// Employee Avatar Component
const EmployeeAvatar: React.FC<{ employee: EmployeeDto | null; size?: 'sm' | 'md' | 'lg' }> = ({ employee, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const getInitials = (name?: string) => {
    if (!name) return 'E';
    const nameParts = name.trim().split(' ');
    if (nameParts.length >= 2) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`.toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase();
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-primary flex items-center justify-center text-white font-medium border-2 border-border/20`}>
      <span className="text-xs">
        {getInitials(employee?.name)}
      </span>
    </div>
  );
};

const Employees: React.FC = () => {
  const { isRTL } = useDirection();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<EmployeeSortBy>(EmployeeSortBy.Name);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDto | null>(null);
  const [selectedEmployeeForDetails, setSelectedEmployeeForDetails] = useState<EmployeeDto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Form setup
  const createForm = useForm<CreateEmployeeDto>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      isActive: true,
    },
  });

  const editForm = useForm<UpdateEmployeeDto>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      isActive: true,
    },
  });

  // Handle navigation state (if coming from other pages)
  React.useEffect(() => {
    if (location.state?.editEmployee) {
      const employee = location.state.editEmployee as EmployeeDto;
      setSelectedEmployee(employee);
      editForm.reset({
        name: employee.name,
        email: employee.email,
        password: '',
        isActive: employee.isActive,
      });
      setIsEditDialogOpen(true);
      navigate(location.pathname, { replace: true });
    } else if (location.state?.viewEmployee) {
      const employee = location.state.viewEmployee as EmployeeDto;
      setSelectedEmployeeForDetails(employee);
      setIsDetailsDialogOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, location.pathname, navigate, editForm]);

  // Query for employees data based on search term
  const { data: employeesData, isLoading, error } = useQuery({
    queryKey: ['employees', currentPage, pageSize, statusFilter, searchTerm, sortBy],
    queryFn: () => {
      if (searchTerm.trim()) {
        // Use search endpoint if there's a search term
        return employeeService.searchEmployees({
          searchTerm: searchTerm.trim(),
          page: currentPage,
          pageSize,
          activeOnly: statusFilter === 'all' ? undefined : statusFilter === 'active',
          sortBy,
        });
      } else {
        // Use regular get endpoint
        const params: {
          page: number;
          pageSize: number;
          activeOnly?: boolean;
        } = {
          page: currentPage,
          pageSize,
        };

        if (statusFilter === 'active') {
          params.activeOnly = true;
        } else if (statusFilter === 'inactive') {
          params.activeOnly = false;
        }

        return employeeService.getEmployees(params);
      }
    },
  });

  // Query for all employees to calculate stats
  const { data: allEmployeesData } = useQuery({
    queryKey: ['employees-all'],
    queryFn: () => employeeService.getEmployees({ pageSize: 1000 }),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: employeeService.registerEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees-all'] });
      toast.success(isRTL ? 'تم إنشاء الموظف بنجاح' : 'Employee created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء الموظف' : 'Error creating employee'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEmployeeDto }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees-all'] });
      toast.success(isRTL ? 'تم تحديث الموظف بنجاح' : 'Employee updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث الموظف' : 'Error updating employee'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: employeeService.deleteEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees-all'] });
      toast.success(isRTL ? 'تم حذف الموظف بنجاح' : 'Employee deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف الموظف' : 'Error deleting employee'));
    },
  });

  // Stats
  const stats = {
    total: allEmployeesData?.totalCount || 0,
    active: allEmployeesData?.items.filter(e => e.isActive).length || 0,
    inactive: allEmployeesData?.items.filter(e => !e.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateEmployeeDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateEmployeeDto) => {
    if (!selectedEmployee) return;
    
    // Only include password if it's not empty
    const submitData: UpdateEmployeeDto = {
      name: data.name,
      email: data.email,
      isActive: data.isActive,
    };
    
    if (data.password && data.password.trim() !== '') {
      submitData.password = data.password;
    }
    
    updateMutation.mutate({ id: selectedEmployee.userId, data: submitData }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedEmployee(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (employee: EmployeeDto) => {
    setSelectedEmployee(employee);
    editForm.reset({
      name: employee.name,
      email: employee.email,
      password: '',
      isActive: employee.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (employee: EmployeeDto) => {
    setSelectedEmployeeForDetails(employee);
    setIsDetailsDialogOpen(true);
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive
        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
        : 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'}`}>
        <div className={`w-2 h-2 rounded-full animate-pulse ${isActive
          ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50'
          : 'bg-red-500 shadow-sm shadow-red-500/50'}`} />
        <span className="font-semibold">
          {isRTL ? (isActive ? 'نشط' : 'غير نشط') : (isActive ? 'Active' : 'Inactive')}
        </span>
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US');
  };

  const getFullName = (employee: EmployeeDto) => {
    return employee.name;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة الموظفين' : 'Employees Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة بيانات الموظفين والحسابات' : 'Manage employee data and accounts'}
            </p>
          </div>
          <Button
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4" />
            {isRTL ? 'إضافة موظف جديد' : 'Add New Employee'}
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي الموظفين' : 'Total Employees'}
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
                    {isRTL ? 'الموظفين النشطين' : 'Active Employees'}
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
                    {isRTL ? 'الموظفين غير النشطين' : 'Inactive Employees'}
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
                  placeholder={isRTL ? 'البحث في الموظفين...' : 'Search employees...'}
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
                      <div className={`w-2 h-2 rounded-full ${statusFilter === 'active' ? 'bg-emerald-500' :
                        statusFilter === 'inactive' ? 'bg-red-500' :
                          'bg-gradient-to-r from-emerald-500 to-red-500'
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
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {isRTL ? 'نشط' : 'Active'}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setStatusFilter('inactive')}
                      className="flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      {isRTL ? 'غير نشط' : 'Inactive'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
                    >
                      {isRTL ? 'ترتيب حسب' : 'Sort by'}
                      <ChevronDown className="h-4 w-4 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setSortBy(EmployeeSortBy.Name)}>
                      {isRTL ? 'الاسم' : 'Name'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              {isRTL ? `${employeesData?.items.length || 0} موظف` : `${employeesData?.items.length || 0} Employees`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الموظف' : 'Employee'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'البريد الإلكتروني' : 'Email'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className={isRTL ? 'mr-2' : 'ml-2'}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={5} className="text-center py-8 text-destructive">
                      {isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                    </TableCell>
                  </TableRow>
                ) : (employeesData?.items.length || 0) === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد موظفين متاحين' : 'No employees available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  employeesData?.items.map((employee) => (
                    <TableRow key={employee.userId} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-3 ${isRTL ? 'text-right' : 'flex-row'}`}>
                          <EmployeeAvatar employee={employee} />
                          <div>
                            <p className="font-medium">{getFullName(employee)}</p>
                            {/* <p className="text-sm text-muted-foreground">ID: {employee.userId}</p> */}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{employee.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(employee.isActive)}</TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(employee.createdAt)}
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
                              onClick={() => handleShowDetails(employee)}
                            >
                              <Eye className="h-4 w-4" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleEdit(employee)}
                            >
                              <Edit className="h-4 w-4" />
                              {isRTL ? 'تحرير' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => deleteMutation.mutate(employee.userId)}
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

            {/* Pagination */}
            {employeesData && employeesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL
                    ? `عرض ${((employeesData.page - 1) * employeesData.pageSize) + 1} إلى ${Math.min(employeesData.page * employeesData.pageSize, employeesData.totalCount)} من ${employeesData.totalCount}`
                    : `Showing ${((employeesData.page - 1) * employeesData.pageSize) + 1} to ${Math.min(employeesData.page * employeesData.pageSize, employeesData.totalCount)} of ${employeesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!employeesData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${employeesData.page} من ${employeesData.totalPages}` : `${employeesData.page} of ${employeesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!employeesData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Employee Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة موظف جديد' : 'Add New Employee'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات الموظف الجديد' : 'Enter the details for the new employee'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'الاسم مطلوب' : 'Name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الاسم' : 'Name'}</FormLabel>
                      <FormControl>
                        <Input placeholder={isRTL ? 'مثال: أحمد محمد' : 'e.g., John Doe'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  rules={{
                    required: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder={isRTL ? 'example@email.com' : 'example@email.com'} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  rules={{
                    required: isRTL ? 'كلمة المرور مطلوبة' : 'Password is required',
                    minLength: {
                      value: 6,
                      message: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'كلمة المرور' : 'Password'}</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
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
                          {isRTL ? 'الموظف نشط' : 'Active Employee'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الموظف' : 'Enable or disable this employee'}
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
                    {createMutation.isPending ? (isRTL ? 'جاري الإنشاء...' : 'Creating...') : (isRTL ? 'إنشاء' : 'Create')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Employee Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير الموظف' : 'Edit Employee'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات الموظف' : 'Update the employee details'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  rules={{ required: isRTL ? 'الاسم مطلوب' : 'Name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الاسم' : 'Name'}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="email"
                  rules={{
                    required: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: isRTL ? 'البريد الإلكتروني غير صحيح' : 'Invalid email address'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="password"
                  rules={{
                    minLength: {
                      value: 6,
                      message: isRTL ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'كلمة المرور (اختيارية)' : 'Password (Optional)'}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder={isRTL ? 'اتركه فارغاً للاحتفاظ بكلمة المرور الحالية' : 'Leave empty to keep current password'} {...field} />
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
                          {isRTL ? 'الموظف نشط' : 'Active Employee'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الموظف' : 'Enable or disable this employee'}
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
                    {updateMutation.isPending ? (isRTL ? 'جاري التحديث...' : 'Updating...') : (isRTL ? 'حفظ التغييرات' : 'Save Changes')}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Employee Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <EmployeeAvatar employee={selectedEmployeeForDetails} size="md" />
                {isRTL ? 'تفاصيل الموظف' : 'Employee Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات الموظف' : 'Comprehensive view of employee information'}
              </DialogDescription>
            </DialogHeader>

            {selectedEmployeeForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <User className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الاسم الكامل' : 'Full Name'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm font-medium">{getFullName(selectedEmployeeForDetails)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedEmployeeForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'البريد الإلكتروني' : 'Email'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{selectedEmployeeForDetails.email}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(selectedEmployeeForDetails.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatDate(selectedEmployeeForDetails.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      {isRTL ? 'إحصائيات الموظف' : 'Employee Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedEmployeeForDetails.userId}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'معرف المستخدم' : 'User ID'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-emerald-600 mb-1">
                          {selectedEmployeeForDetails.email.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'طول البريد الإلكتروني' : 'Email Length'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className={`text-2xl font-bold mb-1 ${selectedEmployeeForDetails.isActive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {selectedEmployeeForDetails.isActive ? '✓' : '✗'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'حالة النشاط' : 'Active Status'}
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
                  setSelectedEmployeeForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedEmployeeForDetails) {
                    handleEdit(selectedEmployeeForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedEmployeeForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير الموظف' : 'Edit Employee'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Employees;
