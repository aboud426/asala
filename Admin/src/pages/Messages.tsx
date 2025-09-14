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
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  CheckCircle,
  XCircle,
  Power,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Globe,
  Languages as LanguagesIcon,
  Eye,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import messageService, { 
  Message, 
  CreateMessageDto, 
  UpdateMessageDto,
  CreateMessageLocalizedDto,
  UpdateMessageLocalizedDto,
  PaginatedResult 
} from '@/services/messageService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';
import MissingMessageTranslationsWarning from '@/components/ui/missing-message-translations-warning';
import MissingMessageTranslationsModal from '@/components/ui/missing-message-translations-modal';

const Messages: React.FC = () => {
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedMessageForDetails, setSelectedMessageForDetails] = useState<Message | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [isMissingTranslationsModalOpen, setIsMissingTranslationsModalOpen] = useState(false);
  const [dismissedWarning, setDismissedWarning] = useState(false);

  // Form setup
  const createForm = useForm<CreateMessageDto>({
    defaultValues: {
      key: '',
      defaultText: '',
      localizations: [],
    },
  });

  const editForm = useForm<UpdateMessageDto>({
    defaultValues: {
      key: '',
      defaultText: '',
      isActive: true,
      localizations: [],
    },
  });

  const {
    fields: createLocalizations,
    append: appendCreateLocalization,
    remove: removeCreateLocalization,
  } = useFieldArray({
    control: createForm.control,
    name: 'localizations',
  });

  const {
    fields: editLocalizations,
    append: appendEditLocalization,
    remove: removeEditLocalization,
  } = useFieldArray({
    control: editForm.control,
    name: 'localizations',
  });

  // Query for messages data
  const { data: messagesData, isLoading, error } = useQuery({
    queryKey: ['messages', currentPage, pageSize, statusFilter],
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
      
      return messageService.getMessages(params);
    },
  });

  // Query for all messages to calculate stats
  const { data: allMessagesData } = useQuery({
    queryKey: ['messages-all'],
    queryFn: () => messageService.getMessages({ pageSize: 1000 }),
  });

  // Query for languages dropdown
  const { data: languagesData } = useQuery({
    queryKey: ['languages-dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query for messages missing translations
  const { data: missingTranslationsIds } = useQuery({
    queryKey: ['messages-missing-translations'],
    queryFn: () => messageService.getMessagesMissingTranslations(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: messageService.createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-all'] });
      toast.success(isRTL ? 'تم إنشاء الرسالة بنجاح' : 'Message created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء إنشاء الرسالة' : 'Error creating message'));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateMessageDto }) => 
      messageService.updateMessage(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-all'] });
      toast.success(isRTL ? 'تم تحديث الرسالة بنجاح' : 'Message updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث الرسالة' : 'Error updating message'));
    },
  });

  const toggleMutation = useMutation({
    mutationFn: messageService.toggleMessageActivation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-all'] });
      toast.success(isRTL ? 'تم تحديث حالة الرسالة' : 'Message status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء تحديث حالة الرسالة' : 'Error updating message status'));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: messageService.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['messages-all'] });
      toast.success(isRTL ? 'تم حذف الرسالة بنجاح' : 'Message deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'حدث خطأ أثناء حذف الرسالة' : 'Error deleting message'));
    },
  });

  // Filter messages client-side for search
  const filteredMessages = messagesData?.items.filter(message => {
    const matchesSearch = message.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.defaultText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.localizations.some(loc => 
                           loc.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           loc.languageName.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    return matchesSearch;
  }) || [];

  // Stats
  const stats = {
    total: allMessagesData?.totalCount || 0,
    active: allMessagesData?.items.filter(m => m.isActive).length || 0,
    inactive: allMessagesData?.items.filter(m => !m.isActive).length || 0,
  };

  // Form handlers
  const onCreateSubmit = async (data: CreateMessageDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsCreateDialogOpen(false);
        createForm.reset();
      },
    });
  };

  const onEditSubmit = async (data: UpdateMessageDto) => {
    if (!selectedMessage) return;
    updateMutation.mutate({ id: selectedMessage.id, data }, {
      onSuccess: () => {
        setIsEditDialogOpen(false);
        setSelectedMessage(null);
        editForm.reset();
      },
    });
  };

  const handleEdit = (message: Message) => {
    setSelectedMessage(message);
    editForm.reset({
      key: message.key,
      defaultText: message.defaultText,
      isActive: message.isActive,
      localizations: message.localizations.map(loc => ({
        id: loc.id,
        key: loc.key,
        text: loc.text,
        languageId: loc.languageId,
        isActive: loc.isActive,
      })),
    });
    setIsEditDialogOpen(true);
  };

  const handleShowDetails = (message: Message) => {
    setSelectedMessageForDetails(message);
    setIsDetailsDialogOpen(true);
  };

  const addNewLocalization = (isEdit: boolean = false) => {
    const newLocalization = {
      key: isEdit ? editForm.getValues('key') : createForm.getValues('key'),
      text: '',
      languageId: 0,
      isActive: true,
    };

    if (isEdit) {
      appendEditLocalization(newLocalization);
    } else {
      appendCreateLocalization(newLocalization);
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isRTL ? 'إدارة الرسائل' : 'Messages Management'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL ? 'إدارة رسائل التطبيق وترجماتها' : 'Manage application messages and their translations'}
            </p>
          </div>
          <Button 
            className="gradient-primary flex items-center gap-2"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            {isRTL ? 'إضافة رسالة جديدة' : 'Add New Message'}
          </Button>
        </div>

        {/* Missing Translations Warning */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && !dismissedWarning && (
          <MissingMessageTranslationsWarning
            missingCount={missingTranslationsIds.length}
            onApplyTranslations={() => setIsMissingTranslationsModalOpen(true)}
            onDismiss={() => setDismissedWarning(true)}
            className="mb-6"
          />
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'إجمالي الرسائل' : 'Total Messages'}
                  </p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-elegant">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {isRTL ? 'الرسائل النشطة' : 'Active Messages'}
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
                    {isRTL ? 'الرسائل غير النشطة' : 'Inactive Messages'}
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
                  placeholder={isRTL ? 'البحث في الرسائل...' : 'Search messages...'}
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
                      <div className={`w-2 h-2 rounded-full ${
                        statusFilter === 'active' ? 'bg-primary' : 
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

        {/* Messages Table */}
        <Card className="border-0 shadow-elegant">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              {isRTL ? `${filteredMessages.length} رسالة` : `${filteredMessages.length} Messages`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table dir={isRTL ? 'rtl' : 'ltr'}>
              <TableHeader>
                <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'مفتاح الرسالة' : 'Message Key'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'النص الافتراضي' : 'Default Text'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الترجمات' : 'Localizations'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'الحالة' : 'Status'}</TableHead>
                  <TableHead className={isRTL ? 'text-right' : 'text-left'}>{isRTL ? 'تاريخ الإنشاء' : 'Created Date'}</TableHead>
                  <TableHead className="text-center">{isRTL ? 'الإجراءات' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className={isRTL ? 'mr-2' : 'ml-2'}>{isRTL ? 'جاري التحميل...' : 'Loading...'}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8 text-destructive">
                      {isRTL ? 'خطأ في تحميل البيانات' : 'Error loading data'}
                    </TableCell>
                  </TableRow>
                ) : filteredMessages.length === 0 ? (
                  <TableRow className={isRTL ? 'text-right' : 'text-left'}>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {isRTL ? 'لا توجد رسائل متاحة' : 'No messages available'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredMessages.map((message) => (
                    <TableRow key={message.id} className={`hover:bg-muted/50 ${isRTL ? 'text-right' : 'text-left'}`}>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex items-center gap-3 ${isRTL ? ' text-right' : 'flex-row'}`}>
                          <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-primary-foreground" />
                          </div>
                          <div>
                            <p className="font-medium font-mono text-sm text-right">{message.key}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className="max-w-xs">
                          <p className="text-sm truncate" title={message.defaultText}>
                            {message.defaultText || (isRTL ? 'لا يوجد نص افتراضي' : 'No default text')}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>
                        <div className={`flex flex-wrap gap-1 ${isRTL ? 'text-right justify-start' : 'justify-start'}`}>
                          {message.localizations.map((loc) => (
                            <Badge key={loc.id} variant="outline" className="text-xs">
                              <Globe className={`h-3 w-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                              {loc.languageCode}
                            </Badge>
                          ))}
                          {message.localizations.length === 0 && (
                            <span className="text-xs text-muted-foreground">
                              {isRTL ? 'لا توجد ترجمات' : 'No translations'}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className={isRTL ? 'text-right' : 'text-left'}>{getStatusBadge(message.isActive)}</TableCell>
                      <TableCell className={`text-muted-foreground ${isRTL ? 'text-right' : 'text-left'}`}>
                        {formatDate(message.createdAt)}
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
                              onClick={() => handleShowDetails(message)}
                            >
                              <Eye className="h-4 w-4" />
                              {isRTL ? 'عرض التفاصيل' : 'View Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => handleEdit(message)}
                            >
                              <Edit className="h-4 w-4" />
                              {isRTL ? 'تحرير' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => toggleMutation.mutate(message.id)}
                            >
                              <Power className="h-4 w-4" />
                              {isRTL ? 'تغيير الحالة' : 'Toggle Status'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className={`flex items-center gap-2 text-destructive ${isRTL ? 'flex-row-reverse' : 'flex-row'}`}
                              onClick={() => deleteMutation.mutate(message.id)}
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
            {messagesData && messagesData.totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  {isRTL 
                    ? `عرض ${((messagesData.page - 1) * messagesData.pageSize) + 1} إلى ${Math.min(messagesData.page * messagesData.pageSize, messagesData.totalCount)} من ${messagesData.totalCount}`
                    : `Showing ${((messagesData.page - 1) * messagesData.pageSize) + 1} to ${Math.min(messagesData.page * messagesData.pageSize, messagesData.totalCount)} of ${messagesData.totalCount}`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={!messagesData.hasPreviousPage}
                  >
                    {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                  </Button>
                  <span className="text-sm font-medium">
                    {isRTL ? `${messagesData.page} من ${messagesData.totalPages}` : `${messagesData.page} of ${messagesData.totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!messagesData.hasNextPage}
                  >
                    {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Message Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'إضافة رسالة جديدة' : 'Add New Message'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'أدخل معلومات الرسالة الجديدة وترجماتها' : 'Enter the details for the new message and its translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="key"
                  rules={{ required: isRTL ? 'مفتاح الرسالة مطلوب' : 'Message key is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'مفتاح الرسالة' : 'Message Key'}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isRTL ? 'مثال: welcome_message' : 'e.g., welcome_message'} 
                          {...field} 
                          className="font-mono"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="defaultText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'النص الافتراضي' : 'Default Text'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={isRTL ? 'النص الافتراضي للرسالة' : 'Default message text'} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Localizations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{isRTL ? 'الترجمات' : 'Localizations'}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addNewLocalization(false)}
                    >
                      <Plus className="h-4 w-4" />
                      {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                    </Button>
                  </div>
                  
                  {createLocalizations.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium">
                          {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                        </h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCreateLocalization(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={createForm.control}
                          name={`localizations.${index}.languageId`}
                          rules={{ required: isRTL ? 'اللغة مطلوبة' : 'Language is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select Language'} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languagesData?.map((lang) => (
                                    <SelectItem key={lang.id} value={lang.id.toString()}>
                                      <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        {lang.name} ({lang.code})
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={createForm.control}
                          name={`localizations.${index}.text`}
                          rules={{ required: isRTL ? 'النص مطلوب' : 'Text is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'النص المترجم' : 'Translated Text'}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder={isRTL ? 'النص المترجم' : 'Translated text'} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="gradient-primary">
                    {isRTL ? 'إنشاء' : 'Create'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Message Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isRTL ? 'تحرير الرسالة' : 'Edit Message'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'قم بتحديث معلومات الرسالة وترجماتها' : 'Update the message details and translations'}
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="key"
                  rules={{ required: isRTL ? 'مفتاح الرسالة مطلوب' : 'Message key is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'مفتاح الرسالة' : 'Message Key'}</FormLabel>
                      <FormControl>
                        <Input {...field} className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="defaultText"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'النص الافتراضي' : 'Default Text'}</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
                          {isRTL ? 'الرسالة نشطة' : 'Active Message'}
                        </FormLabel>
                        <div className="text-sm text-muted-foreground">
                          {isRTL ? 'تفعيل أو إلغاء تفعيل الرسالة' : 'Enable or disable this message'}
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

                {/* Edit Localizations */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{isRTL ? 'الترجمات' : 'Localizations'}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addNewLocalization(true)}
                    >
                      <Plus className="h-4 w-4" />
                      {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                    </Button>
                  </div>
                  
                  {editLocalizations.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium">
                          {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                        </h5>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEditLocalization(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={editForm.control}
                          name={`localizations.${index}.languageId`}
                          rules={{ required: isRTL ? 'اللغة مطلوبة' : 'Language is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder={isRTL ? 'اختر اللغة' : 'Select Language'} />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languagesData?.map((lang) => (
                                    <SelectItem key={lang.id} value={lang.id.toString()}>
                                      <div className="flex items-center gap-2">
                                        <Globe className="h-4 w-4" />
                                        {lang.name} ({lang.code})
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={editForm.control}
                          name={`localizations.${index}.text`}
                          rules={{ required: isRTL ? 'النص مطلوب' : 'Text is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'النص المترجم' : 'Translated Text'}</FormLabel>
                              <FormControl>
                                <Textarea {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="mt-4">
                        <FormField
                          control={editForm.control}
                          name={`localizations.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm">
                                  {isRTL ? 'الترجمة نشطة' : 'Active Translation'}
                                </FormLabel>
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
                      </div>
                    </Card>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" className="gradient-primary">
                    {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Message Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                {isRTL ? 'تفاصيل الرسالة' : 'Message Details'}
              </DialogTitle>
              <DialogDescription>
                {isRTL ? 'عرض شامل لمعلومات الرسالة وترجماتها' : 'Comprehensive view of message information and translations'}
              </DialogDescription>
            </DialogHeader>
            
            {selectedMessageForDetails && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-primary" />
                      {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'مفتاح الرسالة' : 'Message Key'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <code className="text-sm font-mono">{selectedMessageForDetails.key}</code>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'الحالة' : 'Status'}
                        </label>
                        <div className="p-3">
                          {getStatusBadge(selectedMessageForDetails.isActive)}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ الإنشاء' : 'Created Date'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedMessageForDetails.createdAt)}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">
                          {isRTL ? 'تاريخ التحديث' : 'Last Modified'}
                        </label>
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <span className="text-sm">{formatDate(selectedMessageForDetails.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-muted-foreground">
                        {isRTL ? 'النص الافتراضي' : 'Default Text'}
                      </label>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm leading-relaxed">
                          {selectedMessageForDetails.defaultText || (isRTL ? 'لا يوجد نص افتراضي' : 'No default text')}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Localizations */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      {isRTL ? 'الترجمات' : 'Localizations'}
                      <Badge variant="secondary" className="ml-2">
                        {selectedMessageForDetails.localizations.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedMessageForDetails.localizations.length === 0 ? (
                      <div className="text-center py-8">
                        <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">
                          {isRTL ? 'لا توجد ترجمات متاحة لهذه الرسالة' : 'No translations available for this message'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {selectedMessageForDetails.localizations.map((localization, index) => (
                          <Card key={localization.id} className="border border-border/50">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                      <Globe className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-sm">
                                        {localization.languageName} ({localization.languageCode})
                                      </h4>
                                      <p className="text-xs text-muted-foreground">
                                        {isRTL ? `الترجمة ${index + 1}` : `Translation ${index + 1}`}
                                      </p>
                                    </div>
                                  </div>
                                  {getStatusBadge(localization.isActive)}
                                </div>
                                <div className="space-y-2">
                                  <label className="text-xs font-medium text-muted-foreground">
                                    {isRTL ? 'النص المترجم' : 'Translated Text'}
                                  </label>
                                  <div className="p-3 bg-muted/30 rounded-lg">
                                    <p className="text-sm leading-relaxed">
                                      {localization.text}
                                    </p>
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/30">
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {isRTL ? 'تاريخ الإنشاء' : 'Created'}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(localization.createdAt)}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-xs font-medium text-muted-foreground">
                                      {isRTL ? 'تاريخ التحديث' : 'Updated'}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(localization.updatedAt)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      {isRTL ? 'إحصائيات الرسالة' : 'Message Statistics'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedMessageForDetails.localizations.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'إجمالي الترجمات' : 'Total Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-primary mb-1">
                          {selectedMessageForDetails.localizations.filter(l => l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات نشطة' : 'Active Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-secondary-foreground mb-1">
                          {selectedMessageForDetails.localizations.filter(l => !l.isActive).length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'ترجمات غير نشطة' : 'Inactive Translations'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-muted/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 mb-1">
                          {selectedMessageForDetails.key.length}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isRTL ? 'طول المفتاح' : 'Key Length'}
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
                  setSelectedMessageForDetails(null);
                }}
              >
                {isRTL ? 'إغلاق' : 'Close'}
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={() => {
                  if (selectedMessageForDetails) {
                    handleEdit(selectedMessageForDetails);
                    setIsDetailsDialogOpen(false);
                    setSelectedMessageForDetails(null);
                  }
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                {isRTL ? 'تحرير الرسالة' : 'Edit Message'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Missing Translations Modal */}
        {missingTranslationsIds && missingTranslationsIds.length > 0 && (
          <MissingMessageTranslationsModal
            isOpen={isMissingTranslationsModalOpen}
            onOpenChange={setIsMissingTranslationsModalOpen}
            missingMessageIds={missingTranslationsIds}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Messages;
