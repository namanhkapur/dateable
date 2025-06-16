import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock media data
const mockMedia = [
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
  const [preview, setPreview] = useState<null | typeof mockMedia[0]>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tab, setTab] = useState<'all' | 'photo' | 'video'>('all');

  const filtered = tab === 'all' ? mockMedia : mockMedia.filter(m => m.type === tab);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-md bg-white text-black border px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition-colors"
        >
          View All Media
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full min-h-[500px] max-h-[80vh] flex flex-col">
        <DialogTitle>Media Library from {username}</DialogTitle>
        <Tabs value={tab} onValueChange={(v: string) => setTab(v as 'all' | 'photo' | 'video')} className="mt-4 flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="photo">Photos</TabsTrigger>
            <TabsTrigger value="video">Videos</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="flex-1">
            <div className="grid grid-cols-3 gap-4 p-4 overflow-y-auto h-[45vh] items-stretch">
              {filtered.map(media => (
                <MediaCard
                  key={media.id}
                  media={media}
                  hovered={hoveredId === media.id}
                  setHovered={setHoveredId}
                  onClick={() => setPreview(media)}
                />
              ))}
            </div>
          </TabsContent>
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
  media: typeof mockMedia[0],
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