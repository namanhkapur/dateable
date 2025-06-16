import { useState } from 'react';

interface Asset {
  id: string;
  type: string;
  url?: string;
  question?: string;
  answer?: string;
  answers?: string[];
}

export function MediaCard({ asset }: { asset: Asset }) {
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
          <div className="animate-pulse w-full h-full" />
        </div>
      )}
      {asset.type === 'photo' && asset.url && (
        <img
          src={asset.url}
          alt="Profile media"
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          onLoad={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}
      {asset.type === 'video' && asset.url && (
        <video
          src={asset.url}
          className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
          controls
          onLoadedData={() => setIsLoading(false)}
          onError={() => setHasError(true)}
        />
      )}
    </div>
  );
}
