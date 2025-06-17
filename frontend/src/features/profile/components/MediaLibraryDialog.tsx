import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Upload, X, Image, Film } from 'lucide-react';

interface UploadedFile {
  file: File;
  preview?: string;
}

interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  duration?: number;
}

// Initial mock media data
const initialMockMedia: MediaItem[] = [
  { id: '1', type: 'photo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80' },
  { id: '2', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 10 },
  { id: '3', type: 'photo', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80' },
  { id: '4', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', duration: 5 },
];

// Simple cn utility for className merging
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export function MediaLibraryDialog({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>(initialMockMedia);
  const [preview, setPreview] = useState<MediaItem | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'photo' | 'video' | 'upload'>('all');
  
  // Upload state
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE_URL = 'http://localhost:80';
  const HARDCODED_USER_ID = 2;

  const filtered = tab === 'all' ? media : media.filter(m => m.type === tab);

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
      return file.type.startsWith('image/') || file.type.startsWith('video/');
    });

    if (validFiles.length !== files.length) {
      showMessage('Some files were skipped due to invalid file types', 'error');
    }

    const filesWithPreviews = await Promise.all(
      validFiles.map(async (file) => {
        try {
          const preview = await createFilePreview(file);
          return { file, preview };
        } catch {
          return { file };
        }
      })
    );

    setSelectedFiles(prev => [...prev, ...filesWithPreviews]);
  }, []);

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

      // Add hardcoded userId to upsert photos to DB
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

        // Upsert uploaded media to the media library
        if (result.uploaded && result.uploaded.length > 0) {
          const newMedia = result.uploaded
            .filter((upload: any) => upload.success && upload.asset)
            .map((upload: any) => ({
              id: upload.asset.id,
              url: upload.asset.url,
              type: upload.asset.type === 'photo' ? 'photo' as const : 'video' as const,
              duration: upload.asset.type === 'video' ? upload.asset.duration : undefined,
            }));
          
          setMedia(prev => [...prev, ...newMedia]);
        }

        if (result.errors && result.errors.length > 0) {
          result.errors.forEach((error: any) => {
            showMessage(`Failed to upload ${error.file}: ${error.error}`, 'error');
          });
        }

        // Clear files after successful upload and switch back to all tab
        clearFiles();
        setTab('all');
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-md bg-white text-black border px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition-colors"
        >
          View All Media
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl w-full min-h-[600px] max-h-[85vh] flex flex-col">
        <DialogTitle>Media Library for {username}</DialogTitle>
        <Tabs value={tab} onValueChange={(v: string) => setTab(v as 'all' | 'photo' | 'video' | 'upload')} className="mt-4 flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All ({media.length})</TabsTrigger>
            <TabsTrigger value="photo">Photos ({media.filter(m => m.type === 'photo').length})</TabsTrigger>
            <TabsTrigger value="video">Videos ({media.filter(m => m.type === 'video').length})</TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>
          
          {/* Upload Tab Content */}
          {tab === 'upload' && (
            <TabsContent value="upload" className="flex-1 space-y-4">
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
                    Supports: Images and Videos • User ID: {HARDCODED_USER_ID}
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
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
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} file(s) to Database`}
              </Button>
            </TabsContent>
          )}
          
          {/* Media Grid for all, photo, video tabs */}
          {tab !== 'upload' && (
            <TabsContent value={tab} className="flex-1">
              <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto h-[45vh] items-stretch">
                {filtered.map(mediaItem => (
                  <MediaCard
                    key={mediaItem.id}
                    media={mediaItem}
                    hovered={hoveredId === mediaItem.id}
                    setHovered={setHoveredId}
                    onClick={() => setPreview(mediaItem)}
                  />
                ))}
                {filtered.length === 0 && (
                  <div className="col-span-3 flex items-center justify-center h-40 text-muted-foreground">
                    <div className="text-center">
                      <div className="text-2xl mb-2">📁</div>
                      <p>No {tab === 'all' ? 'media' : tab + 's'} found</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => setTab('upload')}
                      >
                        Upload Files
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          )}
        </Tabs>
        {/* Fullscreen Preview */}
        {preview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setPreview(null)}>
            <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
              {preview.type === 'photo' ? (
                <img 
                  src={preview.url} 
                  alt="Preview" 
                  className="w-full h-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/600x400?text=Image+Not+Available';
                  }}
                />
              ) : (
                <video 
                  src={preview.url} 
                  controls 
                  autoPlay 
                  className="w-full h-auto rounded-lg bg-black"
                  onError={(e) => {
                    const target = e.target as HTMLVideoElement;
                    target.style.display = 'none';
                    target.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'h-[400px]', 'bg-gray-900', 'text-white', 'text-center', 'p-4');
                    if (target.parentElement) {
                      target.parentElement.innerHTML = 'Video failed to load. Please try again later.';
                    }
                  }}
                />
              )}
              <button className="absolute top-2 right-2 text-white text-2xl" onClick={() => setPreview(null)}>✕</button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function MediaCard({ media, hovered, setHovered, onClick }: {
  media: MediaItem,
  hovered: boolean,
  setHovered: (id: string | null) => void,
  onClick: () => void
}) {
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Autoplay video on hover
  function handleMouseEnter() {
    setHovered(media.id);
    if (media.type === 'video' && videoRef && !hasError) {
      videoRef.currentTime = 0;
      videoRef.play().catch(() => setHasError(true));
    }
  }

  function handleMouseLeave() {
    setHovered(null);
    if (media.type === 'video' && videoRef && !hasError) {
      videoRef.pause();
      videoRef.currentTime = 0;
    }
  }

  if (hasError) {
    return (
      <div
        className={cn(
          'relative aspect-square w-full h-full rounded-lg overflow-hidden cursor-pointer group transition-all border-2 bg-gray-100 flex items-center justify-center',
          hovered ? 'border-primary shadow-lg z-10' : 'border-muted'
        )}
        onClick={onClick}
      >
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-500">Failed to load {media.type}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative aspect-square w-full h-full rounded-lg overflow-hidden cursor-pointer group transition-all border-2',
        hovered ? 'border-primary shadow-lg z-10' : 'border-muted'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      
      {media.type === 'photo' ? (
        <img 
          src={media.url} 
          alt="Media" 
          className={cn("w-full h-full object-cover", isLoading ? 'opacity-0' : 'opacity-100')}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <video
          ref={setVideoRef}
          src={media.url}
          className={cn("w-full h-full object-cover", isLoading ? 'opacity-0' : 'opacity-100')}
          muted
          loop
          playsInline
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
      
      {/* Overlay on hover */}
      {hovered && media.type === 'video' && !hasError && (
        <span className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          {media.duration ? `${media.duration}s` : ''}
        </span>
      )}
    </div>
  );
} 