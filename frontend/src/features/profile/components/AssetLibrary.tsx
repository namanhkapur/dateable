import { useState } from 'react';
import { PhotoUploadDialog } from '@/components/PhotoUpload';

interface AssetLibraryProps {
  isOwner: boolean;
  assets: {
    media: Array<{
      id: string;
      url: string;
      type: 'photo' | 'video';
    }>;
    prompts: Array<{
      id: string;
      question: string;
      type: 'written' | 'voice';
    }>;
  };
}

export function AssetLibrary({ isOwner, assets }: AssetLibraryProps) {
  const [activeTab, setActiveTab] = useState<'media' | 'prompts'>('media');
  const [media, setMedia] = useState(assets.media);

  const handleUploadComplete = (uploadedAssets: any[]) => {
    // Convert uploaded assets to the expected format
    const newMedia = uploadedAssets
      .filter(upload => upload.success && upload.asset)
      .map(upload => ({
        id: upload.asset.id,
        url: upload.asset.url,
        type: upload.asset.type === 'photo' ? 'photo' as const : 'video' as const,
      }));
    
    setMedia(prev => [...prev, ...newMedia]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Asset Library</h2>
        {isOwner && (
          <div className="flex space-x-2">
            <PhotoUploadDialog onUploadComplete={handleUploadComplete}>
              <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                Upload Media
              </button>
            </PhotoUploadDialog>
            <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Upload Prompts
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b">
        <button
          onClick={() => setActiveTab('media')}
          className={`border-b-2 px-4 py-2 ${
            activeTab === 'media'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Media
        </button>
        <button
          onClick={() => setActiveTab('prompts')}
          className={`border-b-2 px-4 py-2 ${
            activeTab === 'prompts'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground'
          }`}
        >
          Prompts
        </button>
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'media' ? (
          <MediaGrid media={media} isOwner={isOwner} onUploadComplete={handleUploadComplete} />
        ) : (
          <PromptsList prompts={assets.prompts} isOwner={isOwner} />
        )}
      </div>
    </div>
  );
}

function MediaGrid({
  media,
  isOwner,
  onUploadComplete,
}: {
  media: AssetLibraryProps['assets']['media'];
  isOwner: boolean;
  onUploadComplete?: (uploadedAssets: any[]) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {media.map((item) => (
        <div key={item.id} className="relative aspect-square">
          {item.type === 'photo' ? (
            <img
              src={item.url}
              alt="Media item"
              className="h-full w-full rounded-lg object-cover"
            />
          ) : (
            <video
              src={item.url}
              className="h-full w-full rounded-lg object-cover"
            />
          )}
          {isOwner && (
            <button className="absolute right-2 top-2 rounded-full bg-background/80 p-1 hover:bg-background">
              ✕
            </button>
          )}
        </div>
      ))}
      {isOwner && (
        <PhotoUploadDialog onUploadComplete={onUploadComplete}>
          <button className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary">
            <div className="text-center">
              <div className="text-2xl">+</div>
              <p className="mt-1 text-sm text-muted-foreground">Add Media</p>
            </div>
          </button>
        </PhotoUploadDialog>
      )}
    </div>
  );
}

function PromptsList({
  prompts,
  isOwner,
}: {
  prompts: AssetLibraryProps['assets']['prompts'];
  isOwner: boolean;
}) {
  return (
    <div className="space-y-4">
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-1">
            <p className="font-medium">{prompt.question}</p>
            <p className="text-sm text-muted-foreground capitalize">
              {prompt.type} prompt
            </p>
          </div>
          {isOwner && (
            <button className="rounded-full p-1 hover:bg-muted">
              ✕
            </button>
          )}
        </div>
      ))}
      {isOwner && (
        <button className="w-full rounded-md border p-2 text-muted-foreground hover:bg-muted">
          + Add Prompt
        </button>
      )}
    </div>
  );
} 