import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Loader2, 
  AlertCircle,
  ExternalLink 
} from 'lucide-react';
import { useDirection } from '@/contexts/DirectionContext';
import { cn } from '@/lib/utils';
import imageService from '@/services/imageService';
import { toast } from 'sonner';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  className?: string;
  folder?: string;
  showUrlInput?: boolean;
  placeholder?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  folder = 'categories',
  showUrlInput = true,
  placeholder
}) => {
  const { isRTL } = useDirection();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [urlInput, setUrlInput] = useState(value || '');

  const handleFileSelect = async (file: File) => {
    // Validate file
    const validation = imageService.validateFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);

    try {
      const uploadResult = await imageService.uploadImage(file, folder);
      const fullUrl = window.location.origin + uploadResult.fileUrl;
      onChange(fullUrl);
      setUrlInput(fullUrl);
      toast.success(isRTL ? 'تم رفع الصورة بنجاح' : 'Image uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : (isRTL ? 'حدث خطأ أثناء رفع الصورة' : 'Error uploading image'));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleUrlChange = (newUrl: string) => {
    setUrlInput(newUrl);
    onChange(newUrl);
  };

  const handleRemoveImage = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Image Preview */}
      {value && (
        <div className="relative">
          <div className="w-full max-w-xs mx-auto">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border">
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Show placeholder if image fails to load - same as Categories
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiB4MT0iMCUiIHkxPSIwJSIgeDI9IjEwMCUiIHkyPSIxMDAlIj48c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojOGY5MGZmO3N0b3Atb3BhY2l0eToxIi8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMzM4ZWY3O3N0b3Atb3BhY2l0eToxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9InVybCgjZ3JhZCkiLz48cmVjdCB4PSIyMCIgeT0iMzAiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgZmlsbD0id2hpdGUiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PHJlY3QgeD0iMzUiIHk9IjM1IiB3aWR0aD0iNDUiIGhlaWdodD0iNDUiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPjxjaXJjbGUgY3g9IjQ1IiBjeT0iNDgiIHI9IjYiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNiIvPjxwYXRoIGQ9Ik0zNSA2NUw0OCA1NUw1OCA2Mkw3MCA1Mkw4MCA1OVY4MEgzNVY2NVoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNCIvPjwvc3ZnPg==';
                }}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 rounded-full"
                onClick={handleRemoveImage}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 transition-colors',
          dragOver && 'border-primary bg-primary/5',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && 'hover:border-primary/50 cursor-pointer'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? openFileDialog : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={disabled}
        />

        <div className="text-center">
          {isUploading ? (
            <div className="space-y-2">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-sm text-muted-foreground">
                {isRTL ? 'جاري رفع الصورة...' : 'Uploading image...'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isRTL ? 'اختر صورة أو اسحبها هنا' : 'Choose an image or drag it here'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isRTL ? 'PNG، JPG، GIF حتى 10MB' : 'PNG, JPG, GIF up to 10MB'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Manual URL Input */}
      {showUrlInput && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            {isRTL ? 'أو أدخل رابط الصورة' : 'Or enter image URL'}
          </Label>
          <div className="flex gap-2">
            <Input
              type="url"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder={placeholder || (isRTL ? 'https://example.com/image.jpg' : 'https://example.com/image.jpg')}
              disabled={disabled}
              className="flex-1"
            />
            {urlInput && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => window.open(urlInput, '_blank')}
                disabled={disabled}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      <div className="text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <ImageIcon className="h-3 w-3" />
          <span>
            {isRTL 
              ? 'الأنواع المدعومة: JPG, PNG, GIF, BMP, WebP'
              : 'Supported formats: JPG, PNG, GIF, BMP, WebP'
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-3 w-3" />
          <span>
            {isRTL 
              ? 'الحد الأقصى لحجم الملف: 10MB'
              : 'Maximum file size: 10MB'
            }
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
