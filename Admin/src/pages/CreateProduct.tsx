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
  Package,
  ArrowLeft,
  Save,
  Image as ImageIcon,
  DollarSign,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productService, { 
  CreateProductWithMediaDto,
  CreateProductLocalizedDto,
  ProviderDropdownDto,
} from '@/services/productService';
import productCategoryService, {
  ProductCategoryDropdownDto,
} from '@/services/productCategoryService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

interface CreateProductFormData {
  name: string;
  categoryId: number;
  providerId: number;
  price: number;
  quantity: number;
  description: string;
  isActive: boolean;
  localizations: CreateProductLocalizedDto[];
  mediaUrls: { url: string }[];
}

const CreateProduct: React.FC = () => {
  const navigate = useNavigate();
  const { isRTL } = useDirection();
  const queryClient = useQueryClient();

  // Query to get product categories for dropdown
  const { data: categories = [] } = useQuery({
    queryKey: ['product-categories', 'dropdown'],
    queryFn: () => productCategoryService.getProductCategoriesDropdown(),
  });

  // Query to get providers for dropdown
  const { data: providers = [] } = useQuery({
    queryKey: ['providers', 'dropdown'],
    queryFn: () => productService.getProvidersDropdown(isRTL ? 'ar' : 'en'),
  });

  // Query to get languages for localization
  const { data: languages = [] } = useQuery({
    queryKey: ['languages', 'dropdown'],
    queryFn: () => languageService.getLanguagesDropdown(),
  });

  // Create product mutation
  const createMutation = useMutation({
    mutationFn: productService.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Product created successfully');
      navigate('/products');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });

  const form = useForm<CreateProductFormData>({
    defaultValues: {
      name: '',
      categoryId: 0,
      providerId: 0,
      price: 0,
      quantity: 1,
      description: '',
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

  const handleCreateProduct = async (data: CreateProductFormData) => {
    try {
      const createDto: CreateProductWithMediaDto = {
        name: data.name,
        categoryId: data.categoryId,
        providerId: data.providerId,
        price: data.price,
        quantity: data.quantity,
        description: data.description,
        isActive: data.isActive,
        localizeds: data.localizations,
        mediaUrls: data.mediaUrls.map(media => media.url).filter(url => url.trim() !== ''),
      };

      await createMutation.mutateAsync(createDto);
    } catch (error) {
      // Error is handled in the mutation's onError callback
    }
  };

  const addLocalization = () => {
    appendLocalization({
      languageId: 0,
      nameLocalized: '',
      descriptionLocalized: '',
    });
  };

  const addMedia = () => {
    appendMedia({ url: '' });
  };

  const handleCancel = () => {
    navigate('/products');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isRTL ? 'إضافة منتج جديد' : 'Add New Product'}
            </h1>
            <p className="text-muted-foreground">
              {isRTL
                ? 'إنشاء منتج جديد مع الصور والتفاصيل'
                : 'Create a new product with images and details'}
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
          <form onSubmit={form.handleSubmit(handleCreateProduct)} className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{ required: isRTL ? 'اسم المنتج مطلوب' : 'Product name is required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'اسم المنتج' : 'Product Name'}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="categoryId"
                    rules={{ 
                      required: isRTL ? 'الفئة مطلوبة' : 'Category is required',
                      validate: (value) => value > 0 || (isRTL ? 'يرجى اختيار فئة' : 'Please select a category')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'الفئة' : 'Category'}</FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={isRTL ? 'اختر الفئة' : 'Select category'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.id.toString()}>
                                {category.name}
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
                    name="providerId"
                    rules={{ 
                      required: isRTL ? 'مقدم الخدمة مطلوب' : 'Provider is required',
                      validate: (value) => value > 0 || (isRTL ? 'يرجى اختيار مقدم خدمة' : 'Please select a provider')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'مقدم الخدمة' : 'Provider'}</FormLabel>
                        <Select
                          value={field.value?.toString() || ''}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={isRTL ? 'اختر مقدم الخدمة' : 'Select provider'}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {providers.map((provider) => (
                              <SelectItem key={provider.userId} value={provider.userId.toString()}>
                                {provider.businessName}
                                {provider.phoneNumber && (
                                  <span className="text-muted-foreground ml-2">
                                    ({provider.phoneNumber})
                                  </span>
                                )}
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
                    name="price"
                    rules={{ 
                      required: isRTL ? 'السعر مطلوب' : 'Price is required',
                      validate: (value) => value > 0 || (isRTL ? 'السعر يجب أن يكون أكبر من صفر' : 'Price must be greater than zero')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4" />
                          {isRTL ? 'السعر' : 'Price'}
                        </FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            step="0.01" 
                            min="0"
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    rules={{ 
                      required: isRTL ? 'الكمية مطلوبة' : 'Quantity is required',
                      validate: (value) => value > 0 || (isRTL ? 'الكمية يجب أن تكون أكبر من صفر' : 'Quantity must be greater than zero')
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{isRTL ? 'الكمية' : 'Quantity'}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            type="number" 
                            min="1"
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
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
                            ? 'تفعيل أو إلغاء تفعيل المنتج'
                            : 'Enable or disable the product'}
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
                                  folder="products"
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
                    <Package className="w-5 h-5" />
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
                          name={`localizations.${index}.nameLocalized`}
                          rules={{ required: isRTL ? 'اسم المنتج المترجم مطلوب' : 'Localized product name is required' }}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{isRTL ? 'اسم المنتج المترجم' : 'Localized Product Name'}</FormLabel>
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
                      : (isRTL ? 'إنشاء منتج' : 'Create Product')}
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

export default CreateProduct;
