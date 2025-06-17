import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';

// Remove mockProfile, use profile prop instead

export function ProfileViewModal({ isOwner = false, profile, onClose }: { isOwner?: boolean, profile: any, onClose: () => void }) {
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    // Get user name from session storage
    const storedUserName = sessionStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  if (!profile) {
    return (
      <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="max-w-xl w-full p-0 bg-muted">
          <div className="flex items-center justify-between px-6 pt-6 pb-2">
            <DialogTitle className="text-2xl font-bold">Create Your First Profile</DialogTitle>
          </div>
          <div className="overflow-y-auto max-h-[80vh] px-6 pb-6">
            <div className="flex flex-col gap-4">
              <div className="text-center py-8">
                <p className="text-lg mb-4">Welcome, {userName}!</p>
                <p className="text-muted-foreground">Start by creating your first profile. You can add photos, prompts, and more.</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Organize assets to ensure media starts and ends the sequence
  const organizeAssets = (assets: any[]) => {
    if (!assets?.length) return [];
    
    const media = assets.filter(a => a.type === 'photo' || a.type === 'video');
    const prompts = assets.filter(a => a.type === 'text' || a.type === 'multi' || a.type === 'audio');
    
    // If no media, return empty array (shouldn't happen based on your data structure)
    if (!media.length) return [];

    // If only media, return all media
    if (!prompts.length) return media;

    // Calculate how to distribute prompts between media
    const result = [];
    const promptsPerGap = Math.floor(prompts.length / (media.length - 1)) || 1;
    let promptIndex = 0;

    // Add first media
    result.push(media[0]);

    // Interleave media and prompts
    for (let i = 1; i < media.length; i++) {
      // Add prompts between media
      for (let j = 0; j < promptsPerGap && promptIndex < prompts.length; j++) {
        result.push(prompts[promptIndex]);
        promptIndex++;
      }
      // Add next media
      result.push(media[i]);
    }

    // Add any remaining prompts before the last media
    while (promptIndex < prompts.length) {
      // Remove last media
      const lastMedia = result.pop();
      // Add prompt
      result.push(prompts[promptIndex]);
      promptIndex++;
      // Put last media back
      result.push(lastMedia);
    }

    return result;
  };

  const organizedAssets = organizeAssets(profile.assets);

  return (
    <Dialog open={true} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-xl w-full p-0 bg-muted">
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <DialogTitle className="text-2xl font-bold">{profile.title || profile.name}</DialogTitle>
          {isOwner && (
            <button className="rounded-md bg-primary text-primary-foreground px-3 py-1 text-sm font-medium shadow hover:bg-primary/90">Edit</button>
          )}
        </div>
        <div className="overflow-y-auto max-h-[80vh] px-6 pb-6">
          <div className="flex flex-col gap-4">
            {organizedAssets.map((asset: any) => (
              asset.type === 'photo' || asset.type === 'video' 
                ? <MediaCard key={asset.id} asset={asset} />
                : <PromptCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MediaCard({ asset }: { asset: any }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="w-full aspect-square mx-auto rounded-md bg-gray-100 flex items-center justify-center">
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm text-gray-500">Failed to load {asset.type}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full aspect-square mx-auto rounded-md bg-white shadow-sm overflow-hidden relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
      {asset.type === 'photo' ? (
        <img 
          src={asset.url} 
          alt="Profile asset" 
          className="w-full h-full object-cover"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      ) : (
        <video 
          src={asset.url} 
          controls 
          className="w-full h-full object-cover bg-black"
          onLoadedData={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      )}
    </div>
  );
}

function PromptCard({ asset }: { asset: any }) {
  if (asset.type === 'text') {
    return (
      <div className="p-4 bg-white rounded-md shadow-sm flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground mb-1">{asset.question}</div>
        <div className="text-2xl font-bold leading-tight">{asset.answer}</div>
      </div>
    );
  }

  if (asset.type === 'multi') {
    return (
      <div className="p-4 bg-white rounded-md shadow-sm flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground mb-1">{asset.question}</div>
        <div className="space-y-2">
          {asset.options.map((opt: string, i: number) => (
            <div key={i} className="rounded-md bg-muted px-4 py-3 text-base font-medium">
              {opt}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (asset.type === 'audio') {
    return (
      <div className="p-4 bg-white rounded-md shadow-sm flex flex-col space-y-2">
        <div className="text-sm text-muted-foreground mb-1">{asset.question}</div>
        <audio 
          controls 
          src={asset.audioUrl} 
          className="w-full max-w-md"
          onError={(e) => {
            const target = e.target as HTMLAudioElement;
            target.style.display = 'none';
            const errorMsg = document.createElement('div');
            errorMsg.className = 'text-sm text-red-500';
            errorMsg.textContent = 'Failed to load audio';
            target.parentElement?.appendChild(errorMsg);
          }}
        />
      </div>
    );
  }

  return null;
} 