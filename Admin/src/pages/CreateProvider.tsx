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
  Store,
  ArrowLeft,
  Star,
  Save,
  Image as ImageIcon,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import providerService, { 
  CreateProviderByAdminDto,
  CreateProviderLocalizedDto,
} from '@/services/providerService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

interface CreateProviderFormData {
  email: string;
  phoneNumber?: string;
  locationId?: number;
  isActive: boolean;
  businessName: string;
  description: string;
  rating: number;
  parentId?: number;
  localizations: CreateProviderLocalizedDto[];
  images: { url: string }[];
}

const CreateProvider: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();

  // Query to get languages for localization
  const { data: languages = [] } = useQuery({
    queryKey: ['languages', 'dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Create provider mutation
  const createMutation = useMutation({
    mutationFn: providerService.createProvider,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providers'] });
      toast.success('Provider created successfully');
      navigate('/providers');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create provider');
    },
  });

  const form = useForm<CreateProviderFormData>({
    defaultValues: {
      email: '',
      phoneNumber: '',
      locationId: undefined,
      isActive: true,
      businessName: '',
      description: '',
      rating: 3,
      parentId: undefined,
      localizations: [],
      images: [],
    },
  });

  const { fields: localizationFields, append: appendLocalization, remove: removeLocalization } = useFieldArray({
    control: form.control,
    name: 'localizations',
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const handleCreateProvider = async (data: CreateProviderFormData) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (error) {
      // Error is handled in the mutation's onError callback
    }
  };

  const addLocalization = () => {
    appendLocalization({
      languageId: 0,
      businessNameLocalized: '',
      descriptionLocalized: '',
      isActive: true,
    });
  };

  const addImage = () => {
    appendImage({ url: '' });
  };

  const handleCancel = () => {
    navigate('/providers');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'إضافة مقدم خدمة جديد' : 'Add New Provider'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? 'إنشاء مقدم خدمة جديد مع معلومات المستخدم والمحتوى المحلي'
                : 'Create a new provider with user information and localized content'}
            </p>
          </div>
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

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateProvider)} className="space-y-6">
            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {isRTL ? 'معلومات المستخدم' : 'User Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{ required: isRTL ? 'البريد الإلكتروني مطلوب' : 'Email is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'البريد الإلكتروني' : 'Email'}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
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
                </div>

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
                            ? 'تفعيل أو إلغاء تفعيل مقدم الخدمة'
                            : 'Enable or disable the provider account'}
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

            {/* Business Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  {isRTL ? 'معلومات الأعمال' : 'Business Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="businessName"
                    rules={{ required: isRTL ? 'اسم الشركة مطلوب' : 'Business name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'اسم الشركة' : 'Business Name'}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'التقييم' : 'Rating'}</FormLabel>
                        <Select
                          value={field.value?.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((rating) => (
                              <SelectItem key={rating} value={rating.toString()}>
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {Array.from({ length: 5 }, (_, i) => (
                                      <Star
                                        key={i}
                                        className={`w-3 h-3 ${
                                          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                                </div>
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
                  rules={{ required: isRTL ? 'الوصف مطلوب' : 'Description is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {isRTL ? 'الصور' : 'Images'}
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addImage}>
                    <Plus className="w-4 h-4 mr-2" />
                    {isRTL ? 'إضافة صورة' : 'Add Image'}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {imageFields.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isRTL
                      ? 'لا توجد صور حتى الآن. اضغط "إضافة صورة" لبدء إضافة الصور.'
                      : 'No images added yet. Click "Add Image" to start adding images.'}
                  </div>
                ) : (
                  imageFields.map((field, index) => (
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
                            onClick={() => removeImage(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <FormField
                          control={form.control}
                          name={`images.${index}.url`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'رابط الصورة' : 'Image URL'}</FormLabel>
                              <FormControl>
                                <ImageUpload
                                  value={field.value}
                                  onChange={field.onChange}
                                  folder="providers"
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
                    <Store className="w-5 h-5" />
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
                          name={`localizations.${index}.businessNameLocalized`}
                          rules={{ required: isRTL ? 'اسم الشركة المترجم مطلوب' : 'Localized business name is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اسم الشركة المترجم' : 'Localized Business Name'}</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
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
                                <Textarea {...field} rows={3} />
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
                      : (isRTL ? 'إنشاء مقدم خدمة' : 'Create Provider')}
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

export default CreateProvider;
