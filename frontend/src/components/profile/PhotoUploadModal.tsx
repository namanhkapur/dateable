import { X, Image as ImageIcon, Video as VideoIcon } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Asset } from './MediaCard';

interface PhotoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  media: Asset[];
}

export function PhotoUploadModal({ isOpen, onClose, onSelect, media }: PhotoUploadModalProps) {
  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 bg-transparent border-0 max-w-2xl w-full"
        showCloseButton={false}
      >
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-medium">Choose a Photo</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              {media.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  className="relative aspect-square rounded-md overflow-hidden hover:opacity-90 transition-opacity"
                >
                  {item.type === 'photo' ? (
                    <img
                      src={item.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <VideoIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 border-2 border-transparent hover:border-[#7c2e9a] rounded-md transition-colors" />
                </button>
              ))}
            </div>
            
            {media.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-300" />
                <p className="mt-2 text-gray-500">No media found</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
