import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useDirection } from '@/contexts/DirectionContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import VideoUpload from '@/components/upload/VideoUpload';
import { 
  Video, 
  FolderOpen, 
  Download, 
  Trash2,
  RefreshCw,
  Upload,
  Info,
  PlayCircle,
  Clock,
  Monitor
} from 'lucide-react';

interface UploadedVideo {
  fileName: string;
  filePath: string;
  fileUrl: string;
  fileSize: number;
  uploadedAt: string;
  duration: string;
  width: number;
  height: number;
  format: string;
}

const Videos: React.FC = () => {
  const { isRTL } = useDirection();
  const { toast } = useToast();
  
  const [uploadHistory, setUploadHistory] = useState<UploadedVideo[]>([]);
  const [totalUploads, setTotalUploads] = useState(0);
  const [totalSize, setTotalSize] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0); // in seconds
  const [isRefreshing, setIsRefreshing] = useState(false);

  const parseDuration = (duration: string): number => {
    // Parse duration in format "HH:MM:SS" to seconds
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleUploadSuccess = (video: UploadedVideo) => {
    setUploadHistory(prev => [video, ...prev]);
    setTotalUploads(prev => prev + 1);
    setTotalSize(prev => prev + video.fileSize);
    setTotalDuration(prev => prev + parseDuration(video.duration));
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  const handleClearHistory = () => {
    setUploadHistory([]);
    setTotalUploads(0);
    setTotalSize(0);
    setTotalDuration(0);
    
    toast({
      title: isRTL ? "تم مسح التاريخ" : "History cleared",
      description: isRTL ? "تم مسح تاريخ الرفع بنجاح" : "Upload history has been cleared",
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: isRTL ? "تم التحديث" : "Refreshed",
        description: isRTL ? "تم تحديث البيانات بنجاح" : "Data has been refreshed",
      });
    }, 1000);
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {isRTL ? 'إدارة الفيديوهات' : 'Video Management'}
              </h1>
              <p className="text-muted-foreground">
                {isRTL ? 'رفع وإدارة الفيديوهات' : 'Upload and manage videos'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'} ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRTL ? 'تحديث' : 'Refresh'}
            </Button>
            
            {uploadHistory.length > 0 && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleClearHistory}
              >
                <Trash2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'مسح التاريخ' : 'Clear History'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'إجمالي الرفوعات' : 'Total Uploads'}
                  </p>
                  <p className="text-2xl font-bold">{totalUploads}</p>
                </div>
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'إجمالي الحجم' : 'Total Size'}
                  </p>
                  <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'إجمالي المدة' : 'Total Duration'}
                  </p>
                  <p className="text-2xl font-bold">{formatDuration(totalDuration)}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isRTL ? 'جلسة حالية' : 'Current Session'}
                  </p>
                  <p className="text-2xl font-bold">{uploadHistory.length}</p>
                </div>
                <Video className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              {isRTL ? 'رفع الفيديوهات' : 'Upload Videos'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <VideoUpload 
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              maxFiles={5}
            />
          </CardContent>
        </Card>

        {/* Upload History */}
        {uploadHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                {isRTL ? 'تاريخ الرفع' : 'Upload History'}
                <Badge variant="secondary">{uploadHistory.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploadHistory.map((video, index) => (
                  <div key={index}>
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Video className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{video.fileName}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{video.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Monitor className="h-3 w-3" />
                              <span>{video.width}×{video.height}</span>
                            </div>
                            <span>{formatFileSize(video.fileSize)}</span>
                            <span>{video.format.toUpperCase()}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(video.uploadedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(video.fileUrl, '_blank')}
                        >
                          <PlayCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'تشغيل' : 'Play'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = video.fileUrl;
                            link.download = video.fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          {isRTL ? 'تحميل' : 'Download'}
                        </Button>
                      </div>
                    </div>
                    
                    {index < uploadHistory.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-purple-900 mb-2">
                  {isRTL ? 'معلومات مهمة' : 'Important Information'}
                </h3>
                <ul className="text-sm text-purple-800 space-y-1">
                  <li>
                    {isRTL 
                      ? '• الأشكال المدعومة: MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V'
                      : '• Supported formats: MP4, MOV, AVI, MKV, WebM, FLV, WMV, M4V'
                    }
                  </li>
                  <li>
                    {isRTL 
                      ? '• الحد الأقصى لحجم الملف: 500 ميجابايت'
                      : '• Maximum file size: 500MB'
                    }
                  </li>
                  <li>
                    {isRTL 
                      ? '• الحد الأقصى لعدد الملفات: 5 ملفات في كل مرة'
                      : '• Maximum files: 5 files per upload'
                    }
                  </li>
                  <li>
                    {isRTL 
                      ? '• يمكن سحب وإفلات الملفات أو النقر لاختيارها'
                      : '• Drag and drop files or click to browse'
                    }
                  </li>
                  <li>
                    {isRTL 
                      ? '• سيتم استخراج معلومات الفيديو تلقائياً (الدقة، المدة، الصيغة)'
                      : '• Video metadata is automatically extracted (resolution, duration, format)'
                    }
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Videos;

