import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Plus,
  Trash2,
  FileText,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Tag,
  Loader2,
  RefreshCw,
  User,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postService, { 
  CreatePostWithMediaDto,
  CreatePostLocalizedDto,
} from '@/services/postService';
import postTypeService, {
  PostTypeDropdownDto,
} from '@/services/postTypeService';
import productService, { 
  ProviderDropdownDto,
} from '@/services/productService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

interface CreatePostFormData {
  description: string;
  postTypeId: number;
  providerId: number;
  isActive: boolean;
  localizations: CreatePostLocalizedDto[];
  mediaUrls: { url: string }[];
}

const CreatePost: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();

  // Query to get post types for dropdown
  const { 
    data: postTypes = [], 
    isLoading: postTypesLoading, 
    isError: postTypesError,
    refetch: refetchPostTypes 
  } = useQuery({
    queryKey: ['post-types', 'dropdown'],
    queryFn: () => postTypeService.getPostTypesDropdown(),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query to get providers for dropdown
  const { 
    data: providers = [], 
    isLoading: providersLoading, 
    isError: providersError,
    refetch: refetchProviders 
  } = useQuery({
    queryKey: ['providers', 'dropdown'],
    queryFn: () => productService.getProvidersDropdown(isRTL ? 'ar' : 'en'),
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query to get languages for localization
  const { 
    data: languages = [], 
    isLoading: languagesLoading, 
    isError: languagesError 
  } = useQuery({
    queryKey: ['languages', 'dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
    retry: 2,
    staleTime: 10 * 60 * 1000, // 10 minutes (languages change less frequently)
  });

  // Create post mutation
  const createMutation = useMutation({
    mutationFn: postService.createPostWithMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast.success(isRTL ? 'تم إنشاء المنشور بنجاح' : 'Post created successfully');
      navigate('/posts');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل في إنشاء المنشور' : 'Failed to create post'));
    },
  });

  const form = useForm<CreatePostFormData>({
    defaultValues: {
      description: '',
      postTypeId: 0,
      providerId: 0,
      isActive: true,
      localizations: [],
      mediaUrls: [],
    },
  });

  const { fields: localizationFields, append: appendLocalization, remove: removeLocalization } = useFieldArray({
    control: form.control,
    name: 'localizations',
  });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control: form.control,
    name: 'mediaUrls',
  });

  const handleCreatePost = async (data: CreatePostFormData) => {
    try {
      const createDto: CreatePostWithMediaDto = {
        providerId: data.providerId,
        description: data.description,
        postTypeId: data.postTypeId,
        isActive: data.isActive,
        mediaUrls: data.mediaUrls.map(media => media.url).filter(url => url.trim() !== ''),
        localizations: data.localizations.filter(loc => 
          loc.languageId > 0 && loc.descriptionLocalized.trim() !== ''
        ),
      };

      await createMutation.mutateAsync(createDto);
    } catch (error) {
      // Error is handled in the mutation's onError callback
    }
  };

  const addLocalization = () => {
    appendLocalization({
      languageId: 0,
      descriptionLocalized: '',
      isActive: true,
    });
  };

  const addMedia = () => {
    appendMedia({ url: '' });
  };

  const handleCancel = () => {
    navigate('/posts');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'إضافة منشور جديد' : 'Add New Post'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? 'إنشاء منشور جديد مع الصور والتفاصيل'
                : 'Create a new post with images and details'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                refetchPostTypes();
                refetchProviders();
              }}
              disabled={postTypesLoading || providersLoading}
              className="gap-2"
            >
              {postTypesLoading || providersLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {postTypesLoading || providersLoading
                ? (isRTL ? 'جارٍ التحديث...' : 'Refreshing...')
                : (isRTL ? 'تحديث البيانات' : 'Refresh Data')
              }
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreatePost)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="postTypeId"
                    rules={{ 
                      required: isRTL ? 'نوع المنشور مطلوب' : 'Post type is required',
                      validate: (value) => value > 0 || (isRTL ? 'يرجى اختيار نوع المنشور' : 'Please select a post type')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="w-4 h-4" />
                          {isRTL ? 'نوع المنشور' : 'Post Type'}
                          {postTypesLoading && (
                            <span className="text-xs text-muted-foreground">
                              ({isRTL ? 'جارٍ التحميل...' : 'Loading...'})
                            </span>
                          )}
                        </FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={postTypesLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  postTypesLoading 
                                    ? (isRTL ? 'جارٍ تحميل الأنواع...' : 'Loading types...')
                                    : postTypesError
                                    ? (isRTL ? 'خطأ في التحميل' : 'Error loading')
                                    : postTypes.length === 0
                                    ? (isRTL ? 'لا توجد أنواع متاحة' : 'No types available')
                                    : (isRTL ? 'اختر نوع المنشور' : 'Select post type')
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {postTypesError ? (
                              <div className="p-2 text-sm text-destructive">
                                {isRTL ? 'فشل في تحميل أنواع المنشورات' : 'Failed to load post types'}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => refetchPostTypes()}
                                  className="mt-2 w-full text-xs"
                                >
                                  {isRTL ? 'إعادة المحاولة' : 'Retry'}
                                </Button>
                              </div>
                            ) : postTypes.length === 0 && !postTypesLoading ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                {isRTL ? 'لا توجد أنواع منشورات متاحة' : 'No post types available'}
                              </div>
                            ) : (
                              postTypes.map((postType) => (
                                <SelectItem key={postType.id} value={postType.id.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{postType.name}</span>
                                    {postType.description && (
                                      <span className="text-xs text-muted-foreground">
                                        {postType.description}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {postTypesError && (
                          <p className="text-xs text-destructive">
                            {isRTL ? 'تعذر تحميل أنواع المنشورات. يرجى المحاولة مرة أخرى.' : 'Failed to load post types. Please try again.'}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="providerId"
                    rules={{ 
                      required: isRTL ? 'مقدم الخدمة مطلوب' : 'Provider is required',
                      validate: (value) => value > 0 || (isRTL ? 'يرجى اختيار مقدم خدمة' : 'Please select a provider')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          {isRTL ? 'مقدم الخدمة' : 'Provider'}
                          {providersLoading && (
                            <span className="text-xs text-muted-foreground">
                              ({isRTL ? 'جارٍ التحميل...' : 'Loading...'})
                            </span>
                          )}
                        </FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                          disabled={providersLoading}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  providersLoading 
                                    ? (isRTL ? 'جارٍ تحميل مقدمي الخدمة...' : 'Loading providers...')
                                    : providersError
                                    ? (isRTL ? 'خطأ في التحميل' : 'Error loading')
                                    : providers.length === 0
                                    ? (isRTL ? 'لا يوجد مقدمو خدمة' : 'No providers available')
                                    : (isRTL ? 'اختر مقدم الخدمة' : 'Select provider')
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providersError ? (
                              <div className="p-2 text-sm text-destructive">
                                {isRTL ? 'فشل في تحميل مقدمي الخدمة' : 'Failed to load providers'}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => refetchProviders()}
                                  className="mt-2 w-full text-xs"
                                >
                                  {isRTL ? 'إعادة المحاولة' : 'Retry'}
                                </Button>
                              </div>
                            ) : providers.length === 0 && !providersLoading ? (
                              <div className="p-2 text-sm text-muted-foreground">
                                {isRTL ? 'لا يوجد مقدمو خدمة متاحون' : 'No providers available'}
                              </div>
                            ) : (
                              providers.map((provider) => (
                                <SelectItem key={provider.userId} value={provider.userId.toString()}>
                                  <div className="flex flex-col">
                                    <span className="font-medium">{provider.businessName}</span>
                                    {provider.phoneNumber && (
                                      <span className="text-xs text-muted-foreground">
                                        {provider.phoneNumber}
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                        {providersError && (
                          <p className="text-xs text-destructive">
                            {isRTL ? 'تعذر تحميل مقدمي الخدمة. يرجى المحاولة مرة أخرى.' : 'Failed to load providers. Please try again.'}
                          </p>
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: isRTL ? 'الوصف مطلوب' : 'Description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          rows={6} 
                          placeholder={isRTL ? 'اكتب وصف المنشور...' : 'Write post description...'}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          {isRTL ? 'مفعل' : 'Active'}
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          {isRTL
                            ? 'تفعيل أو إلغاء تفعيل المنشور'
                            : 'Enable or disable the post'}
                        </p>
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
              </CardContent>
            </Card>

            {/* Media */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {isRTL ? 'الصور' : 'Images'}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMedia}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'إضافة صورة' : 'Add Image'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mediaFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isRTL
                      ? 'لا توجد صور حتى الآن. اضغط "إضافة صورة" لبدء إضافة الصور.'
                      : 'No images added yet. Click "Add Image" to start adding images.'}
                  </div>
                ) : (
                  mediaFields.map((field, index) => (
                    <Card key={field.id} className="border-2 border-dashed">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {isRTL ? 'صورة' : 'Image'} {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedia(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name={`mediaUrls.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'رابط الصورة' : 'Image URL'}</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value}
                                  onChange={field.onChange}
                                  folder="posts"
                                  placeholder={isRTL ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Localizations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {isRTL ? 'الترجمات' : 'Localizations'}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLocalization}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {localizationFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isRTL
                      ? 'لا توجد ترجمات حتى الآن. اضغط "إضافة ترجمة" لبدء إضافة المحتوى المترجم.'
                      : 'No translations added yet. Click "Add Translation" to start adding localized content.'}
                  </div>
                ) : (
                  localizationFields.map((field, index) => (
                    <Card key={field.id} className="border-2 border-dashed">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {isRTL ? 'ترجمة' : 'Translation'} {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocalization(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <FormField
                          control={form.control}
                          name={`localizations.${index}.languageId`}
                          rules={{ required: isRTL ? 'اللغة مطلوبة' : 'Language is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اللغة' : 'Language'}</FormLabel>
                              <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue
                                      placeholder={isRTL ? 'اختر اللغة' : 'Select language'}
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {languages.map((language) => (
                                    <SelectItem key={language.id} value={language.id.toString()}>
                                      {language.name} ({language.code})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`localizations.${index}.descriptionLocalized`}
                          rules={{ required: isRTL ? 'الوصف المترجم مطلوب' : 'Localized description is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'الوصف المترجم' : 'Localized Description'}</FormLabel>
                              <FormControl>
                                <Textarea 
                                  {...field} 
                                  rows={4} 
                                  placeholder={isRTL ? 'الوصف المترجم للمنشور...' : 'Localized post description...'}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
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
                      </CardContent>
                    </Card>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Form Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={createMutation.isPending}
                  >
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} className="gap-2">
                    <Save className="w-4 h-4" />
                    {createMutation.isPending
                      ? (isRTL ? 'جارٍ الإنشاء...' : 'Creating...')
                      : (isRTL ? 'إنشاء منشور' : 'Create Post')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </Form>
      </div>
    </DashboardLayout>
  );
};

export default CreatePost;
