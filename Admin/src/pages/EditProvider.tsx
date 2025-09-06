import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Plus,
    Trash2,
    Store,
    ArrowLeft,
    Star,
    Save,
    Image as ImageIcon,
    AlertCircle,
    Loader2,
    User,
    Building,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { Switch } from '@/components/ui/switch';
import { useForm, useFieldArray } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import providerService, {
    UpdateProviderByAdminDto,
    UpdateProviderLocalizedDto,
} from '@/services/providerService';
import languageService, { LanguageDropdownDto } from '@/services/languageService';

interface EditProviderFormData {
    email: string;
    phoneNumber?: string;
    locationId?: number;
    isActive: boolean;
    businessName: string;
    description: string;
    rating: number;
    parentId?: number;
    localizations: UpdateProviderLocalizedDto[];
    images: { url: string }[];
}

const EditProvider: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isRTL } = useDirection();
    const queryClient = useQueryClient();

    // Query to get languages for localization
    const { data: languages = [] } = useQuery({
        queryKey: ['languages', 'dropdown'],
        queryFn: () => languageService.getLanguagesDropdown(),
    });

    // Query to get provider details
    const {
        data: provider,
        isLoading: isLoadingProvider,
        error: providerError,
        refetch: refetchProvider,
    } = useQuery({
        queryKey: ['provider', id],
        queryFn: () => providerService.getById(Number(id)),
        enabled: !!id,
    });

    // Update provider mutation
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number, data: UpdateProviderByAdminDto }) =>
            providerService.updateProvider(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['providers'] });
            queryClient.invalidateQueries({ queryKey: ['provider', id] });
            toast.success(isRTL ? 'تم تحديث مقدم الخدمة بنجاح' : 'Provider updated successfully');
            navigate('/providers');
        },
        onError: (error: Error) => {
            toast.error(error.message || (isRTL ? 'فشل في تحديث مقدم الخدمة' : 'Failed to update provider'));
        },
    });

    const form = useForm<EditProviderFormData>({
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

    // Update form values when provider data is loaded
    React.useEffect(() => {
        if (provider) {
            form.reset({
                email: provider.email || '',
                phoneNumber: provider.phoneNumber || '',
                locationId: undefined, // We don't have locationId in the provider response
                isActive: provider.isActive,
                businessName: provider.businessName,
                description: provider.description,
                rating: provider.rating,
                parentId: provider.parentId || undefined,
                localizations: provider.localizations.map(loc => ({
                    id: loc.id,
                    languageId: loc.languageId,
                    businessNameLocalized: loc.businessNameLocalized,
                    descriptionLocalized: loc.descriptionLocalized,
                    isActive: loc.isActive,
                })),
                images: provider.images || [],
            });
        }
    }, [provider, form]);

    const { fields: localizationFields, append: appendLocalization, remove: removeLocalization } = useFieldArray({
        control: form.control,
        name: 'localizations',
    });

    const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
        control: form.control,
        name: 'images',
    });

    const handleUpdateProvider = async (data: EditProviderFormData) => {
        if (!id) return;

        try {
            const updateData: UpdateProviderByAdminDto = {
                ...data,
            };

            await updateMutation.mutateAsync({ id: Number(id), data: updateData });
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

    const handleBack = () => {
        navigate('/providers');
    };

    if (isLoadingProvider) {
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

    if (providerError) {
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
                                {providerError instanceof Error
                                    ? providerError.message
                                    : (isRTL ? 'فشل في تحميل تفاصيل مقدم الخدمة' : 'Failed to load provider details')}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchProvider()}
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

    if (!provider) {
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
                        <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-muted-foreground">
                            {isRTL ? 'مقدم الخدمة غير موجود' : 'Provider not found'}
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
                            {isRTL ? 'تعديل مقدم الخدمة' : 'Edit Provider'}
                        </h1>
                        <p className="text-muted-foreground">
                            {isRTL
                                ? `تعديل تفاصيل ${provider.businessName}`
                                : `Edit details for ${provider.businessName}`}
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
                    <form onSubmit={form.handleSubmit(handleUpdateProvider)} className="space-y-6">
                        {/* User Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
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
                                                    <Input
                                                        {...field}
                                                        type="email"
                                                        placeholder={isRTL ? 'أدخل البريد الإلكتروني' : 'Enter email address'}
                                                    />
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
                                    <Building className="w-5 h-5" />
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
                                                                                className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
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
                                                        {form.watch(`localizations.${index}.id`) && (
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                (ID: {form.watch(`localizations.${index}.id`)})
                                                            </span>
                                                        )}
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

                                                <FormField
                                                    control={form.control}
                                                    name={`localizations.${index}.isActive`}
                                                    render={({ field }) => (
                                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                            <div className="space-y-0.5">
                                                                <FormLabel className="text-sm">
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
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleCancel}
                                        disabled={updateMutation.isPending}
                                    >
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </Button>
                                    <Button type="submit" disabled={updateMutation.isPending} className="gap-2">
                                        <Save className="w-4 h-4" />
                                        {updateMutation.isPending
                                            ? (isRTL ? 'جارٍ التحديث...' : 'Updating...')
                                            : (isRTL ? 'تحديث مقدم الخدمة' : 'Update Provider')}
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

export default EditProvider;
