import { useState } from 'react';
import { Camera, MapPin, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PhotoUploadModal } from './PhotoUploadModal';
import { MOCK_USER_MEDIA } from '@/data/mockMedia';
import { Asset } from './MediaCard';

const prompts = [
  'Caught in the act',
  'You had to be there',
  'Felt cute might delete later',
  'My proudest moment',
  'How I fight the Sunday scaries',
];

export default function PhotoEditor({ index, data, onSave = () => {}, onClose }: { 
  index: number; 
  data: any; 
  onSave?: (data: any) => void;
  onClose: () => void;
}) {
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [caption, setCaption] = useState(data?.caption || '');
  const [location, setLocation] = useState(data?.location || '');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const preview = data?.preview;

  const handleDone = () => {
    onSave({ 
      ...data,
      prompt, 
      caption, 
      location
    });
    onClose();
  };

  return (
    <DialogContent className="p-0 rounded-xl overflow-hidden max-w-md w-full" showCloseButton={false}>
      <div className="bg-white">
        <div className="flex justify-between items-center px-4 pt-4">
          <button 
            className="text-[#7c2e9a] text-sm font-medium"
            onClick={onClose}
          >
            Cancel
          </button>
          <div className="text-sm font-semibold">Edit Photo</div>
          <button
            className="text-[#7c2e9a] text-sm font-medium"
            onClick={handleDone}
          >
            Done
          </button>
        </div>
        <div className="p-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {preview ? (
              <div className="relative w-full h-full">
                <img
                  src={preview}
                  alt="Uploaded preview"
                  className="w-full h-full object-cover"
                />
                {/* Grid lines */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/3 w-full h-px bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute top-2/3 w-full h-px bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute left-1/3 h-full w-px bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
                  <div className="absolute left-2/3 h-full w-px bg-white/80 shadow-[0_0_2px_rgba(0,0,0,0.5)]"></div>
                </div>
                {/* Replace photo button */}
                <button
                  onClick={() => setIsUploadModalOpen(true)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-full flex items-center justify-center w-8 h-8 shadow-md"
                  title="Replace photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
                onClick={() => setIsUploadModalOpen(true)}
              >
                <div className="text-center">
                  <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Add Photo</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prompt</label>
              <select
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#7c2e9a] focus:border-[#7c2e9a]"
              >
                <option value="">Select a prompt</option>
                {prompts.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a caption"
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full pl-10"
                />
              </div>
            </div>
            
            {/* Removed the replace photo button since it's now on the image */}
          </div>
        </div>
      </div>
      
      <PhotoUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSelect={(url) => {
          // Update the preview when a new photo is selected
          onSave({ ...data, preview: url });
          setIsUploadModalOpen(false);
        }}
        media={MOCK_USER_MEDIA}
      />
    </DialogContent>
  );
}

export function PhotoSection() {
  const [photos, setPhotos] = useState<Array<Asset | null>>(Array(6).fill(null));
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [userMedia] = useState<Asset[]>(MOCK_USER_MEDIA);

  function handleAddPhoto(index: number, mediaUrl: string) {
    const mediaItem = userMedia.find(m => m.url === mediaUrl);
    if (!mediaItem) return;

    const updated = [...photos];
    updated[index] = {
      ...mediaItem,
      caption: mediaItem.caption || '',
      location: mediaItem.location || '',
      prompt: mediaItem.prompt || '',
      preview: mediaItem.preview || mediaItem.url
    };
    setPhotos(updated);
  }

  const handleSavePhoto = (index: number, data: any) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], ...data };
    setPhotos(updated);
  };

  return (
    <div className="mt-6">
      <div className="text-xs font-bold text-gray-500 mb-1">My Photos & Videos</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {photos.map((photo, i) => (
          <div key={i} className="relative group">
            {photo ? (
              <Dialog open={editingIndex === i} onOpenChange={(open) => setEditingIndex(open ? i : null)}>
                <DialogTrigger asChild>
                  <div>
                    <img
                      src={photo.preview || photo.url}
                      alt={`Photo ${i + 1}`}
                      className="aspect-square w-full rounded-lg object-cover cursor-pointer"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingIndex(i);
                        }}
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </DialogTrigger>
                <PhotoEditor
                  index={i}
                  data={photo}
                  onSave={(data) => handleSavePhoto(i, data)}
                  onClose={() => setEditingIndex(null)}
                />
              </Dialog>
            ) : (
              <div
                onClick={() => setEditingIndex(i)}
                className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 border-2 border-dashed border-gray-300 cursor-pointer flex items-center justify-center text-gray-400 hover:border-[#7c2e9a] hover:text-[#7c2e9a] transition-colors"
              >
                <Plus className="h-8 w-8" />
              </div>
            )}
            <PhotoUploadModal
              isOpen={editingIndex === i && !photos[i]}
              onClose={() => setEditingIndex(null)}
              onSelect={(url) => {
                handleAddPhoto(i, url);
                setEditingIndex(null);
              }}
              media={userMedia}
            />
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-400">Tap to edit, drag to reorder</div>
    </div>
  );
}
