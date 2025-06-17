import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Upload, X, Image, Film } from 'lucide-react';

interface UploadedFile {
  file: File;
  preview?: string;
}

interface PhotoUploadProps {
  onUploadComplete?: (uploadedAssets: any[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function PhotoUpload({ 
  onUploadComplete, 
  maxFiles = 10, 
  acceptedTypes = ['image/*', 'video/*'],
  className 
}: PhotoUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = 'http://localhost:80';
  const HARDCODED_USER_ID = 2;

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 5000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const createFilePreview = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.src = URL.createObjectURL(file);
        video.currentTime = 1;
        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0);
          resolve(canvas.toDataURL());
          URL.revokeObjectURL(video.src);
        };
        video.onerror = reject;
      } else {
        resolve('');
      }
    });
  };

  const handleFileSelection = useCallback(async (files: File[]) => {
    const validFiles = files.filter(file => {
      const isValidType = acceptedTypes.some(type => {
        if (type === 'image/*') return file.type.startsWith('image/');
        if (type === 'video/*') return file.type.startsWith('video/');
        return file.type === type;
      });
      return isValidType;
    });

    if (validFiles.length !== files.length) {
      showMessage('Some files were skipped due to invalid file types', 'error');
    }

    const remainingSlots = maxFiles - selectedFiles.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      showMessage(`Only ${filesToAdd.length} files added due to maximum limit`, 'error');
    }

    const filesWithPreviews = await Promise.all(
      filesToAdd.map(async (file) => {
        try {
          const preview = await createFilePreview(file);
          return { file, preview };
        } catch {
          return { file };
        }
      })
    );

    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
  }, [selectedFiles.length, maxFiles, acceptedTypes]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelection(files);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) {
      showMessage('Please select files to upload', 'error');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach(({ file }) => {
        formData.append('files', file);
      });

      // Add hardcoded userId to the request
      formData.append('userId', HARDCODED_USER_ID.toString());

      const response = await fetch(`${API_BASE_URL}/uploads/multiple`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const uploadedCount = result.uploaded ? result.uploaded.length : 0;
        showMessage(`Successfully uploaded ${uploadedCount} file(s)`, 'success');

        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: any) => {
            showMessage(`Failed to upload ${error.file}: ${error.error}`, 'error');
          });
        }

        // Clear files after successful upload
        clearFiles();
        
        // Notify parent component of successful upload
        if (onUploadComplete && result.uploaded) {
          onUploadComplete(result.uploaded);
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      showMessage(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload Photos & Videos
        </CardTitle>
        <CardDescription>
          Drag and drop your files or click to select. Maximum {maxFiles} files.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
            isDragOver 
              ? 'border-primary bg-primary/5' 
              : 'border-muted-foreground/25 hover:border-primary'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="space-y-2">
            <div className="text-4xl">📸</div>
            <p className="text-sm text-muted-foreground">
              Drag and drop files here or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports: Images and Videos
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Selected Files ({selectedFiles.length})</h4>
              <Button variant="outline" size="sm" onClick={clearFiles}>
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
              {selectedFiles.map((fileData, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border bg-muted">
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt={fileData.file.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {fileData.file.type.startsWith('image/') ? (
                          <Image className="h-8 w-8 text-muted-foreground" />
                        ) : (
                          <Film className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <div className="mt-1 text-xs text-muted-foreground truncate">
                    {fileData.file.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatFileSize(fileData.file.size)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-md ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Upload Button */}
        <Button 
          onClick={uploadFiles}
          disabled={selectedFiles.length === 0 || isUploading}
          className="w-full"
        >
          {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s)`}
        </Button>
      </CardContent>
    </Card>
  );
}

// Dialog wrapper for use in modals
export function PhotoUploadDialog({ 
  children, 
  onUploadComplete,
  ...props 
}: PhotoUploadProps & { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const handleUploadComplete = (uploadedAssets: any[]) => {
    onUploadComplete?.(uploadedAssets);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Photos & Videos</DialogTitle>
        </DialogHeader>
        <PhotoUpload 
          {...props}
          onUploadComplete={handleUploadComplete}
        />
      </DialogContent>
    </Dialog>
  );
}