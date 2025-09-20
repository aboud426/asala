import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UploadedImage {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
}

interface ImageUploadProps {
  onUploadSuccess?: (image: UploadedImage) => void;
  onUploadError?: (error: string) => void;
  defaultFolder?: string;
  maxFiles?: number;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  defaultFolder = 'uploads',
  maxFiles = 10,
  className
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [folder, setFolder] = useState(defaultFolder);

  const supportedFormats = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    const extension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!supportedFormats.includes(extension)) {
      return `Unsupported format. Supported: ${supportedFormats.join(', ')}`;
    }
    if (file.size > maxFileSize) {
      return `File too large. Maximum size: 10MB`;
    }
    return null;
  };

  const uploadFile = async (file: File): Promise<UploadedImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/images/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Upload failed');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message || 'Upload failed');
    }

    return result.data;
  };

  const handleFiles = useCallback(async (files: FileList) => {
    if (files.length === 0) return;
    
    if (uploadedImages.length + files.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return;
    }

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    // Validate files
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Invalid file",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploading(true);

    // Upload files
    for (const file of validFiles) {
      try {
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simulate progress (since FormData doesn't provide real progress easily)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min(prev[file.name] + Math.random() * 30, 90)
          }));
        }, 200);

        const uploadedImage = await uploadFile(file);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        setUploadedImages(prev => [...prev, uploadedImage]);
        onUploadSuccess?.(uploadedImage);

        toast({
          title: "Upload successful",
          description: `${file.name} uploaded successfully`,
        });

        // Clean up progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[file.name];
            return newProgress;
          });
        }, 2000);

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed';
        
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });

        onUploadError?.(errorMessage);
        
        toast({
          title: "Upload failed",
          description: `${file.name}: ${errorMessage}`,
          variant: "destructive",
        });
      }
    }

    setUploading(false);
  }, [folder, maxFiles, uploadedImages.length, onUploadSuccess, onUploadError, toast]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  }, [handleFiles]);

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('w-full space-y-4', className)}>
      {/* Folder Input */}
      <div className="space-y-2">
        <Label htmlFor="folder">Upload Folder</Label>
        <Input
          id="folder"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder="Enter folder name"
          disabled={uploading}
        />
      </div>

      {/* Upload Area */}
      <Card
        className={cn(
          'border-2 border-dashed transition-colors cursor-pointer',
          isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Upload className="h-12 w-12 text-muted-foreground mb-4" />
          <div className="text-center">
            <p className="text-lg font-semibold">
              Drop images here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Supports: {supportedFormats.join(', ')} • Max size: 10MB • Max files: {maxFiles}
            </p>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept={supportedFormats.join(',')}
            multiple
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          <Label>Upload Progress</Label>
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="truncate">{filename}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Images */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <Label>Uploaded Images ({uploadedImages.length})</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((image, index) => (
              <Card key={index} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{image.fileName}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(image.fileSize)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(image.uploadedAt).toLocaleString()}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        onClick={() => window.open(image.fileUrl, '_blank')}
                      >
                        View Image
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

