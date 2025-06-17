import { useState } from 'react';
import { PhotoUpload } from '@/components/PhotoUpload';
import { AssetLibrary } from './AssetLibrary';

const mockAssets = {
  media: [
    {
      id: 'm1',
      url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80',
      type: 'photo' as const,
    },
    {
      id: 'm2',
      url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      type: 'photo' as const,
    },
  ] as Array<{
    id: string;
    url: string;
    type: 'photo' | 'video';
  }>,
  prompts: [
    {
      id: 'p1',
      question: 'What makes you unique?',
      type: 'written' as const,
    },
  ],
};

export function UploadPage() {
  const [assets, setAssets] = useState(mockAssets);
  const [uploadedCount, setUploadedCount] = useState(0);

  const handleUploadComplete = (uploadedAssets: any[]) => {
    // Convert uploaded assets to the expected format
    const newMedia = uploadedAssets
      .filter(upload => upload.success && upload.asset)
      .map(upload => ({
        id: upload.asset.id,
        url: upload.asset.url,
        type: upload.asset.type === 'photo' ? 'photo' as const : 'video' as const,
      }));
    
    setAssets(prev => ({
      ...prev,
      media: [...prev.media, ...newMedia],
    }));
    
    setUploadedCount(prev => prev + newMedia.length);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upload Your Photos & Videos</h1>
        <p className="text-muted-foreground">
          Build your asset library for creating amazing dating profiles. User ID: 2
        </p>
        {uploadedCount > 0 && (
          <p className="text-sm text-green-600">
            Successfully uploaded {uploadedCount} new assets!
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Component */}
        <div>
          <PhotoUpload
            onUploadComplete={handleUploadComplete}
            maxFiles={20}
            acceptedTypes={['image/*', 'video/*']}
          />
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-4">Your Asset Statistics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{assets.media.length}</div>
                <div className="text-sm text-muted-foreground">Media Files</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{assets.prompts.length}</div>
                <div className="text-sm text-muted-foreground">Prompts</div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg p-6 border">
            <h3 className="text-lg font-semibold mb-2">Tips for Great Photos</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use natural lighting when possible</li>
              <li>• Show your genuine smile</li>
              <li>• Include photos with friends</li>
              <li>• Add variety to your collection</li>
              <li>• Keep videos under 30 seconds</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Asset Library */}
      <div>
        <AssetLibrary isOwner={true} assets={assets} />
      </div>
    </div>
  );
}