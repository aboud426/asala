import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ImageUpload } from '@/components/ui/image-upload';
import {
  Plus,
  Trash2,
  MessageCircle,
  ArrowLeft,
  Save,
  Heart,
  User,
  FileText,
  Globe,
  AlertCircle,
  Loader2,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import postService, { 
  UpdatePostDto,
  UpdatePostLocalizedDto
} from '@/services/postService';
import postTypeService, {
  PostTypeDropdownDto,
} from '@/services/postTypeService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

interface EditPostFormData {
  description: string;
  numberOfReactions: number;
  postTypeId: number;
  isActive: boolean;
  localizations: UpdatePostLocalizedDto[];
  mediaUrls: { url: string }[];
}

const EditPost: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();

  // Query to get post types for dropdown
  const { data: postTypes = [] } = useQuery({
    queryKey: ['post-types', 'dropdown'],
    queryFn: () => postTypeService.getPostTypesDropdown(),
  });

  // Query to get languages for localization
  const { data: languages = [] } = useQuery({
    queryKey: ['languages', 'dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Query to get post details
  const {
    data: post,
    isLoading: isLoadingPost,
    error: postError,
    refetch: refetchPost,
  } = useQuery({
    queryKey: ['post', id],
    queryFn: () => postService.getPostById(Number(id)),
    enabled: !!id,
  });

  // Update post mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: UpdatePostDto }) =>
      postService.updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['post', id] });
      toast.success(isRTL ? 'تم تحديث المنشور بنجاح' : 'Post updated successfully');
      navigate('/posts');
    },
    onError: (error: Error) => {
      toast.error(error.message || (isRTL ? 'فشل في تحديث المنشور' : 'Failed to update post'));
    },
  });

  const form = useForm<EditPostFormData>({
    defaultValues: {
      description: '',
      numberOfReactions: 0,
      postTypeId: 0,
      isActive: true,
      localizations: [],
      mediaUrls: [],
    },
  });

  // Update form values when post data is loaded
  React.useEffect(() => {
    if (post) {
      form.reset({
        description: post.description,
        numberOfReactions: post.numberOfReactions,
        postTypeId: post.postTypeId,
        isActive: post.isActive,
        localizations: post.localizations.map(loc => ({
          id: loc.id,
          languageId: loc.languageId,
          descriptionLocalized: loc.descriptionLocalized,
          isActive: loc.isActive,
        })),
        mediaUrls: (post.mediaUrls || []).map(url => ({ url })),
      });
    }
  }, [post, form]);

  const { fields: localizationFields, append: appendLocalization, remove: removeLocalization } = useFieldArray({
    control: form.control,
    name: 'localizations',
  });

  const { fields: mediaFields, append: appendMedia, remove: removeMedia } = useFieldArray({
    control: form.control,
    name: 'mediaUrls',
  });

  const handleUpdatePost = async (data: EditPostFormData) => {
    if (!id) return;

    try {
      const updateData: UpdatePostDto = {
        description: data.description,
        numberOfReactions: data.numberOfReactions,
        postTypeId: data.postTypeId,
        isActive: data.isActive,
        mediaUrls: data.mediaUrls.map(media => media.url).filter(url => url.trim() !== ''),
        localizations: data.localizations,
      };

      await updateMutation.mutateAsync({ id: Number(id), data: updateData });
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

  const handleBack = () => {
    navigate('/posts');
  };

  if (isLoadingPost) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-20" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>

          {/* Form Skeletons */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                  <Skeleton className="h-24" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (postError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>
                {postError instanceof Error
                  ? postError.message
                  : (isRTL ? 'فشل في تحميل تفاصيل المنشور' : 'Failed to load post details')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchPost()}
                className="ml-2"
              >
                <Loader2 className="w-4 h-4 mr-2" />
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  if (!post) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>

          <div className="text-center py-8">
            <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {isRTL ? 'المنشور غير موجود' : 'Post not found'}
            </h3>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'تعديل المنشور' : 'Edit Post'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? `منشور #${post.id} - ${post.postTypeName || 'نوع المنشور'}`
                : `Post #${post.id} - ${post.postTypeName || 'Post Type'}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              {isRTL ? 'رجوع' : 'Back'}
            </Button>
          </div>
        </div>

        {/* Status and Quick Info */}
        <Card className="border-0 shadow-elegant">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-border/20">
                    <MessageCircle className="w-8 h-8 text-primary/50" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{isRTL ? 'تعديل منشور' : 'Edit Post'}</span>
                      <Badge variant="outline">#{post.id}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {post.postTypeName || (isRTL ? 'نوع المنشور' : 'Post Type')} • {isRTL ? 'بواسطة مستخدم' : 'by User'} #{post.userId}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Badge variant={post.isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
                  {post.isActive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {post.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Heart className="w-3 h-3 text-red-500" />
                  {post.numberOfReactions} {isRTL ? 'تفاعل' : 'reactions'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Globe className="w-3 h-3" />
                  {post.localizations.length} {isRTL ? 'ترجمة' : 'translations'}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {form.watch('mediaUrls')?.length || 0} {isRTL ? 'ملف وسائط' : 'media files'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleUpdatePost)} className="space-y-6">
            {/* Basic Information */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Display User Info (Read-only) */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <User className="w-4 h-4" />
                      {isRTL ? 'المستخدم' : 'User'}
                    </div>
                    <div className="text-sm bg-muted/50 p-4 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>{isRTL ? 'مستخدم' : 'User'} #{post.userId}</span>
                      </div>
                    </div>
                  </div>

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
                          <FileText className="w-4 h-4" />
                          {isRTL ? 'نوع المنشور' : 'Post Type'}
                        </FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={isRTL ? 'اختر نوع المنشور' : 'Select post type'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {postTypes.map((postType) => (
                              <SelectItem key={postType.id} value={postType.id.toString()}>
                                {postType.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  rules={{ required: isRTL ? 'وصف المنشور مطلوب' : 'Post description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {isRTL ? 'وصف المنشور' : 'Post Description'}
                      </FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} className="bg-background" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="numberOfReactions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          {isRTL ? 'عدد التفاعلات' : 'Number of Reactions'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="0"
                            className="bg-background"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/20">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base flex items-center gap-2">
                            {field.value ? (
                              <TrendingUp className="w-4 h-4 text-green-500" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-muted-foreground" />
                            )}
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
                </div>
              </CardContent>
            </Card>

            {/* Media */}
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {isRTL ? 'ملفات الوسائط' : 'Media Files'}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addMedia}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'إضافة وسائط' : 'Add Media'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {mediaFields.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                    <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {isRTL ? 'لا توجد ملفات وسائط' : 'No Media Files'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {isRTL
                        ? 'لا توجد ملفات وسائط حتى الآن. اضغط "إضافة وسائط" لبدء إضافة الصور أو الفيديوهات.'
                        : 'No media files added yet. Click "Add Media" to start adding images or videos.'}
                    </p>
                  </div>
                ) : (
                  mediaFields.map((field, index) => (
                    <Card key={field.id} className="border-2 border-dashed bg-muted/10">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            {isRTL ? 'ملف وسائط' : 'Media File'} {index + 1}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedia(index)}
                            className="text-destructive hover:text-destructive"
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
                              <FormLabel className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                {isRTL ? 'رابط الملف' : 'Media URL'}
                              </FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value}
                                  onChange={field.onChange}
                                  folder="posts"
                                  placeholder={isRTL ? 'https://example.com/media.jpg' : 'https://example.com/media.jpg'}
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
            <Card className="border-0 shadow-elegant">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    {isRTL ? 'الترجمات' : 'Localizations'}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addLocalization}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'إضافة ترجمة' : 'Add Translation'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {localizationFields.length === 0 ? (
                  <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                    <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-muted-foreground mb-2">
                      {isRTL ? 'لا توجد ترجمات' : 'No Translations'}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      {isRTL
                        ? 'لا توجد ترجمات حتى الآن. اضغط "إضافة ترجمة" لبدء إضافة المحتوى المترجم.'
                        : 'No translations added yet. Click "Add Translation" to start adding localized content.'}
                    </p>
                  </div>
                ) : (
                  localizationFields.map((field, index) => (
                    <Card key={field.id} className="border-2 border-dashed bg-muted/10">
                      <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {isRTL ? 'ترجمة' : 'Translation'} {index + 1}
                            {form.watch(`localizations.${index}.id`) && (
                              <Badge variant="outline" className="text-xs">
                                ID: {form.watch(`localizations.${index}.id`)}
                              </Badge>
                            )}
                          </h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocalization(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <FormField
                          control={form.control}
                          name={`localizations.${index}.languageId`}
                          rules={{ required: isRTL ? 'اللغة مطلوبة' : 'Language is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                {isRTL ? 'اللغة' : 'Language'}
                              </FormLabel>
                              <Select
                                value={field.value?.toString() || ''}
                                onValueChange={(value) => field.onChange(parseInt(value))}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-background">
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
                              <FormLabel className="flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                {isRTL ? 'الوصف المترجم' : 'Localized Description'}
                              </FormLabel>
                              <FormControl>
                                <Textarea {...field} rows={3} className="bg-background" />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`localizations.${index}.isActive`}
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-muted/30">
                              <div className="space-y-0.5">
                                <FormLabel className="text-sm flex items-center gap-2">
                                  {field.value ? (
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <TrendingDown className="w-4 h-4 text-muted-foreground" />
                                  )}
                                  {isRTL ? 'ترجمة مفعلة' : 'Active Translation'}
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
            <Card className="border-0 shadow-elegant">
              <CardContent className="pt-8 pb-6">
                <div className="flex items-center gap-4 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                    className="gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {isRTL ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updateMutation.isPending} 
                    className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {updateMutation.isPending
                      ? (isRTL ? 'جارٍ التحديث...' : 'Updating...')
                      : (isRTL ? 'تحديث المنشور' : 'Update Post')}
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

export default EditPost;
