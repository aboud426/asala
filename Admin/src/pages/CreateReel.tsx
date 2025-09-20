import React, { useState } from 'react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    ArrowLeft,
    Save,
    FileText,
    Image as ImageIcon,
    Video,
    Plus,
    X,
    Upload,
    AlertCircle,
    Loader2,
    Play,
    Eye,
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import postTypeService from '@/services/postTypeService';
import reelService, { MediaType, ReelService } from '@/services/reelService';
import TokenManager from '@/utils/tokenManager';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface UploadedFile {
    fileName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    uploadedAt: string;
}

interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string; // This will be the uploaded URL from server
    displayOrder: number;
    filename: string;
    size: number;
    preview: string; // Local preview URL for display
    file: File; // Keep reference to original file for upload
    mediaType: MediaType; // API enum value
    isUploaded: boolean; // Track upload status
}

interface CreateReelFormData {
    description: string;
    postTypeId: number;
    mediaItems: MediaItem[];
}

const CreateReel: React.FC = () => {
    const navigate = useNavigate();
    const { isRTL } = useDirection();
    const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [draggedFiles, setDraggedFiles] = useState<File[]>([]);

    // Query to get post types for dropdown
    const { data: postTypes = [], isLoading: loadingPostTypes } = useQuery({
        queryKey: ['post-types', 'dropdown'],
        queryFn: () => postTypeService.getPostTypesDropdown(),
    });

    const form = useForm<CreateReelFormData>({
        defaultValues: {
            description: '',
            postTypeId: 0,
            mediaItems: [],
        },
    });

    // Upload functions using direct API calls like VideoUpload.tsx
    const uploadVideoFile = async (file: File, folder: string): Promise<UploadedFile> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/videos/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Video upload failed');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Video upload failed');
        }

        return result.data;
    };

    const uploadImageFile = async (file: File, folder: string): Promise<UploadedFile> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await fetch('/api/images/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Image upload failed');
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.message || 'Image upload failed');
        }

        return result.data;
    };

    const onSubmit = async (data: CreateReelFormData) => {
        setIsSubmitting(true);
        try {
            // Get current user from TokenManager
            const userData = TokenManager.getUserData();
            if (!userData || !userData.id) {
                toast.error(isRTL ? 'المستخدم غير مسجل الدخول' : 'User not authenticated');
                return;
            }

            // Check if all media files are uploaded
            const unuploadedItems = mediaItems.filter(item => !item.isUploaded);
            if (unuploadedItems.length > 0) {
                toast.error(
                    `${isRTL ? 'يرجى انتظار اكتمال رفع الملفات' : 'Please wait for file uploads to complete'} (${unuploadedItems.length} ${isRTL ? 'متبقي' : 'remaining'})`
                );
                return;
            }

            // Prepare media URLs for API
            const mediaUrls = mediaItems
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((item) => ({
                    url: item.url,
                    mediaType: item.mediaType,
                    displayOrder: item.displayOrder,
                }));

            // Prepare API payload
            const createReelData = {
                userId: userData.id,
                description: data.description,
                postTypeId: data.postTypeId,
                mediaUrls: mediaUrls,
                // Note: localizations can be added later if needed
                localizations: [],
            };

            console.log('Creating reel with data:', createReelData);

            // Call the reel API
            const result = await reelService.createReel(createReelData);

            toast.success(isRTL ? 'تم إنشاء الريل بنجاح' : 'Reel created successfully');
            console.log('Reel created successfully:', result);

            // Navigate back to reels list (you may need to create this route)
            navigate('/reels');
        } catch (error) {
            console.error('Error creating reel:', error);

            // Handle specific error types
            let errorMessage = isRTL ? 'حدث خطأ أثناء إنشاء الريل' : 'Error creating reel';

            if (error instanceof Error) {
                // Check for common API error patterns
                if (error.message.includes('POST_DESCRIPTION_REQUIRED')) {
                    errorMessage = isRTL ? 'الوصف مطلوب' : 'Description is required';
                } else if (error.message.includes('POST_POSTTYPE_ID_REQUIRED')) {
                    errorMessage = isRTL ? 'نوع المنشور مطلوب' : 'Post type is required';
                } else if (error.message.includes('USER_NOT_FOUND')) {
                    errorMessage = isRTL ? 'المستخدم غير موجود' : 'User not found';
                } else if (error.message.includes('POSTTYPE_NOT_FOUND')) {
                    errorMessage = isRTL ? 'نوع المنشور غير موجود' : 'Post type not found';
                } else if (error.message.includes('HTTP error')) {
                    errorMessage = isRTL ? 'خطأ في الاتصال بالخادم' : 'Server connection error';
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileUpload = async (files: File[]) => {
        setIsUploading(true);
        try {
            const newMediaItems: MediaItem[] = [];

            for (const file of files) {
                const isVideo = file.type.startsWith('video/');
                const isImage = file.type.startsWith('image/');

                if (!isVideo && !isImage) {
                    toast.error(`${file.name}: ${isRTL ? 'نوع الملف غير مدعوم' : 'Unsupported file type'}`);
                    continue;
                }

                // Create preview URL for immediate display
                const previewUrl = URL.createObjectURL(file);

                // Create media item with temporary data (will be updated after upload)
                const mediaItem: MediaItem = {
                    id: Date.now() + Math.random().toString(),
                    type: isVideo ? 'video' : 'image',
                    url: '', // Will be set after upload
                    displayOrder: mediaItems.length + newMediaItems.length,
                    filename: file.name,
                    size: file.size,
                    preview: previewUrl,
                    file: file,
                    mediaType: ReelService.getMediaTypeFromFile(file),
                    isUploaded: false,
                };

                newMediaItems.push(mediaItem);
            }

            // Add items to state immediately for UI feedback
            setMediaItems(prev => [...prev, ...newMediaItems]);

            // Upload files in background and update URLs
            const uploadPromises = newMediaItems.map(async (item) => {
                try {
                    let uploadResult;

                    // Use direct API call based on file type
                    if (item.type === 'video') {
                        uploadResult = await uploadVideoFile(item.file, 'reels');
                    } else {
                        uploadResult = await uploadImageFile(item.file, 'reels');
                    }

                    // Update the media item with the uploaded URL
                    setMediaItems(prev => prev.map(prevItem =>
                        prevItem.id === item.id
                            ? { ...prevItem, url: uploadResult.fileUrl, isUploaded: true }
                            : prevItem
                    ));

                    return uploadResult;
                } catch (error) {
                    console.error(`Failed to upload ${item.filename}:`, error);
                    toast.error(`${item.filename}: ${isRTL ? 'فشل في الرفع' : 'Upload failed'}`);

                    // Remove failed item from list
                    setMediaItems(prev => prev.filter(prevItem => prevItem.id !== item.id));
                    return null;
                }
            });

            // Wait for all uploads to complete
            const results = await Promise.all(uploadPromises);
            const successfulUploads = results.filter(result => result !== null);

            toast.success(
                `${successfulUploads.length} ${isRTL ? 'ملف تم رفعه بنجاح' : 'files uploaded successfully'}`
            );

        } catch (error) {
            console.error('Error uploading files:', error);
            toast.error(isRTL ? 'حدث خطأ أثناء رفع الملفات' : 'Error uploading files');
        } finally {
            setIsUploading(false);
        }
    };

    const removeMediaItem = (id: string) => {
        setMediaItems(prev => {
            const filtered = prev.filter(item => item.id !== id);
            // Reorder display order
            return filtered.map((item, index) => ({
                ...item,
                displayOrder: index,
            }));
        });
    };

    const moveItemUp = (index: number) => {
        if (index === 0) return;
        const items = [...mediaItems];
        [items[index - 1], items[index]] = [items[index], items[index - 1]];

        // Update display order
        const updatedItems = items.map((item, idx) => ({
            ...item,
            displayOrder: idx,
        }));

        setMediaItems(updatedItems);
    };

    const moveItemDown = (index: number) => {
        if (index === mediaItems.length - 1) return;
        const items = [...mediaItems];
        [items[index], items[index + 1]] = [items[index + 1], items[index]];

        // Update display order
        const updatedItems = items.map((item, idx) => ({
            ...item,
            displayOrder: idx,
        }));

        setMediaItems(updatedItems);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileUpload(files);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <DashboardLayout>
            <div className="container mx-auto py-6 space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => navigate('/reels')}
                            className="h-9 w-9"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">
                                {isRTL ? 'إنشاء ريل جديد' : 'Create New Reel'}
                            </h1>
                            <p className="text-muted-foreground">
                                {isRTL
                                    ? 'إنشاء محتوى ريل جديد مع الوصف والوسائط'
                                    : 'Create new reel content with description and media'
                                }
                            </p>
                        </div>
                    </div>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Information */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="description"
                                            rules={{
                                                required: isRTL ? 'الوصف مطلوب' : 'Description is required',
                                                minLength: {
                                                    value: 10,
                                                    message: isRTL ? 'الوصف يجب أن يكون على الأقل 10 أحرف' : 'Description must be at least 10 characters'
                                                }
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{isRTL ? 'الوصف' : 'Description'}</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={isRTL ? 'اكتب وصف الريل...' : 'Enter reel description...'}
                                                            className="min-h-[120px] resize-none"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="postTypeId"
                                            rules={{
                                                required: isRTL ? 'نوع المنشور مطلوب' : 'Post type is required',
                                                validate: (value) => value > 0 || (isRTL ? 'يرجى اختيار نوع المنشور' : 'Please select a post type')
                                            }}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{isRTL ? 'نوع المنشور' : 'Post Type'}</FormLabel>
                                                    <Select
                                                        disabled={loadingPostTypes}
                                                        onValueChange={(value) => field.onChange(parseInt(value))}
                                                        value={field.value?.toString()}
                                                    >
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue
                                                                    placeholder={
                                                                        loadingPostTypes
                                                                            ? (isRTL ? 'جاري التحميل...' : 'Loading...')
                                                                            : (isRTL ? 'اختر نوع المنشور' : 'Select post type')
                                                                    }
                                                                />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {postTypes.map((postType) => (
                                                                <SelectItem
                                                                    key={postType.id}
                                                                    value={postType.id.toString()}
                                                                >
                                                                    {postType.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>

                                {/* Media Upload Section */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <ImageIcon className="h-5 w-5" />
                                            {isRTL ? 'الوسائط المتعددة' : 'Media Content'}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {isRTL
                                                ? 'اسحب الملفات هنا أو انقر لتحديد الصور والفيديوهات'
                                                : 'Drag files here or click to select images and videos'
                                            }
                                        </p>
                                    </CardHeader>
                                    <CardContent>
                                        {/* Upload Zone */}
                                        <div
                                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors"
                                            onDrop={handleDrop}
                                            onDragOver={handleDragOver}
                                        >
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Upload className="h-8 w-8 text-gray-400" />
                                                    <Video className="h-8 w-8 text-gray-400" />
                                                    <ImageIcon className="h-8 w-8 text-gray-400" />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium">
                                                        {isRTL ? 'اسحب الملفات هنا' : 'Drag files here'}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {isRTL ? 'أو انقر لتحديد الملفات' : 'or click to select files'}
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    disabled={isUploading}
                                                    onClick={() => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.multiple = true;
                                                        input.accept = 'image/*,video/*';
                                                        input.onchange = (e) => {
                                                            const target = e.target as HTMLInputElement;
                                                            if (target.files) {
                                                                handleFileUpload(Array.from(target.files));
                                                            }
                                                        };
                                                        input.click();
                                                    }}
                                                >
                                                    {isUploading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                                    {isRTL ? 'اختيار الملفات' : 'Select Files'}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Media Items List */}
                                        {mediaItems.length > 0 && (
                                            <div className="mt-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="font-medium">
                                                        {isRTL ? 'الملفات المحددة' : 'Selected Files'} ({mediaItems.length})
                                                    </h3>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setMediaItems([])}
                                                    >
                                                        {isRTL ? 'مسح الكل' : 'Clear All'}
                                                    </Button>
                                                </div>

                                                <div className="space-y-3">
                                                    {mediaItems.map((item, index) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-4 p-3 border rounded-lg bg-white"
                                                        >
                                                            {/* Reorder Controls */}
                                                            <div className="flex flex-col gap-1">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => moveItemUp(index)}
                                                                    disabled={index === 0}
                                                                >
                                                                    <ChevronUp className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-6 w-6 p-0"
                                                                    onClick={() => moveItemDown(index)}
                                                                    disabled={index === mediaItems.length - 1}
                                                                >
                                                                    <ChevronDown className="h-3 w-3" />
                                                                </Button>
                                                            </div>

                                                            {/* Media Preview */}
                                                            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                                                {item.type === 'image' ? (
                                                                    <img
                                                                        src={item.preview || item.url}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="relative w-full h-full flex items-center justify-center bg-black">
                                                                        <video
                                                                            src={item.preview || item.url}
                                                                            className="w-full h-full object-cover"
                                                                            muted
                                                                        />
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                                                                            <Play className="h-6 w-6 text-white" />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* File Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-sm truncate">
                                                                    {item.filename}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {item.type === 'video' ? '🎥' : '🖼️'} {formatFileSize(item.size)}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {isRTL ? 'الترتيب:' : 'Order:'} {index + 1}
                                                                </p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    {item.isUploaded ? (
                                                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                                                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                                            {isRTL ? 'تم الرفع' : 'Uploaded'}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex items-center gap-1 text-xs text-yellow-600">
                                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                                            {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Actions */}
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        // Preview functionality could be added here
                                                                        if (item.preview) {
                                                                            window.open(item.preview, '_blank');
                                                                        }
                                                                    }}
                                                                >
                                                                    <Eye className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => removeMediaItem(item.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Sidebar */}
                            <div className="space-y-6">
                                {/* Actions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{isRTL ? 'الإجراءات' : 'Actions'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <Button
                                            type="submit"
                                            className="w-full"
                                            disabled={isUploading || isSubmitting || mediaItems.some(item => !item.isUploaded)}
                                        >
                                            {(isSubmitting || isUploading) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                            {!isSubmitting && !isUploading && <Save className="h-4 w-4 mr-2" />}
                                            {isSubmitting
                                                ? (isRTL ? 'جاري إنشاء الريل...' : 'Creating Reel...')
                                                : (isRTL ? 'إنشاء الريل' : 'Create Reel')
                                            }
                                        </Button>

                                        {/* Upload Status Warning */}
                                        {mediaItems.length > 0 && mediaItems.some(item => !item.isUploaded) && (
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription className="text-sm">
                                                    {isRTL
                                                        ? `${mediaItems.filter(item => !item.isUploaded).length} من الملفات ما زالت قيد الرفع`
                                                        : `${mediaItems.filter(item => !item.isUploaded).length} files are still uploading`
                                                    }
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => navigate('/reels')}
                                        >
                                            {isRTL ? 'إلغاء' : 'Cancel'}
                                        </Button>
                                    </CardContent>
                                </Card>

                                {/* Summary */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{isRTL ? 'الملخص' : 'Summary'}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span>{isRTL ? 'الصور:' : 'Images:'}</span>
                                            <span>{mediaItems.filter(item => item.type === 'image').length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>{isRTL ? 'الفيديوهات:' : 'Videos:'}</span>
                                            <span>{mediaItems.filter(item => item.type === 'video').length}</span>
                                        </div>
                                        <div className="flex justify-between text-sm font-medium border-t pt-2">
                                            <span>{isRTL ? 'الإجمالي:' : 'Total:'}</span>
                                            <span>{mediaItems.length}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Help */}
                                <Card>
                                    <CardContent className="pt-6">
                                        <Alert>
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription className="text-sm">
                                                {isRTL
                                                    ? 'استخدم الأسهم لإعادة ترتيب الملفات. الترتيب سيظهر في الريل النهائي.'
                                                    : 'Use the arrow buttons to reorder files. The order will be reflected in the final reel.'
                                                }
                                            </AlertDescription>
                                        </Alert>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </DashboardLayout>
    );
};

export default CreateReel;
