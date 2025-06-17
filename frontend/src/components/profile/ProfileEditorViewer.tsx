import { useState } from 'react';
import { X, ChevronRight, Plus, MapPin, Camera } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface ProfileEditorViewerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: {
    name: string;
    type: string;
  };
}

type ViewMode = 'edit' | 'view';

const prompts = [
  'Caught in the act',
  'You had to be there',
  'Felt cute might delete later',
  'My proudest moment',
  'How I fight the Sunday scaries',
];

function PhotoEditor({ index, data, onSave }: { index: number; data: any; onSave: (data: any) => void }) {
  const [image, setImage] = useState<File | null>(null);
  const [prompt, setPrompt] = useState(data?.prompt || '');
  const [caption, setCaption] = useState(data?.caption || '');
  const [location, setLocation] = useState(data?.location || '');
  const preview = image ? URL.createObjectURL(image) : data?.preview;

  return (
    <DialogContent className="p-0 rounded-xl overflow-hidden max-w-md w-full">
      <div className="bg-white">
        <div className="flex justify-between items-center px-4 pt-4">
          <button className="text-[#7c2e9a] text-sm">Cancel</button>
          <div className="text-sm font-semibold">Edit Photo</div>
          <button className="text-[#7c2e9a] text-sm" onClick={() => onSave({ image, prompt, caption, location, preview })}>Done</button>
        </div>
        {preview && (
          <div className="relative aspect-[3/4] w-full mt-2">
            <Image
              src={preview}
              alt="Uploaded preview"
              fill
              className="object-cover"
            />
            <button className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
              <Camera className="w-3 h-3" /> Replace Photo
            </button>
          </div>
        )}
        {!preview && (
          <div className="px-4 pt-4 pb-2">
            <Input type="file" accept="image/*" onChange={(e) => setImage(e.target.files?.[0] || null)} />
          </div>
        )}
        <div className="px-4 pt-4">
          <label className="text-xs text-gray-500">Select a Prompt</label>
          <select
            className="mt-1 block w-full border rounded p-2 text-sm"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          >
            <option value="">No prompt</option>
            {prompts.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="px-4 pt-3">
          <label className="text-xs text-gray-500">Add a location</label>
          <div className="relative">
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add a location."
              className="pr-8"
            />
            <MapPin className="w-4 h-4 text-gray-400 absolute right-2 top-2.5" />
          </div>
        </div>
        <div className="px-4 pt-3 pb-6">
          <label className="text-xs text-gray-500">Add a caption</label>
          <Input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption."
          />
        </div>
      </div>
    </DialogContent>
  );
}

export function ProfileEditorViewer({ isOpen, onClose, profile }: ProfileEditorViewerProps) {
  const [mode, setMode] = useState<ViewMode>('view');
  const [editedName, setEditedName] = useState(profile.name);
  const [editedType, setEditedType] = useState(profile.type);
  const [photos, setPhotos] = useState(Array(6).fill(null));

  function handleSavePhoto(index: number, data: any) {
    const updated = [...photos];
    updated[index] = data;
    setPhotos(updated);
  }

  if (!isOpen) return null;

  const handleSave = () => {
    // Handle save logic here
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl">
        {/* Header */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                onClick={() => setMode('edit')}
                className={`px-4 py-2 text-sm font-medium ${
                  mode === 'edit' ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                Edit
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => setMode('view')}
                className={`px-4 py-2 text-sm font-medium ${
                  mode === 'view' ? 'text-black font-semibold' : 'text-gray-500'
                }`}
              >
                View
              </button>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'edit' ? (
            <>
              {/* Section: Photos & Prompts */}
              <div className="mt-6">
                <div className="text-xs font-bold text-gray-500 mb-1">My Photos & Videos</div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {photos.map((photo, i) => (
                    <Dialog key={i}>
                      <DialogTrigger asChild>
                        <div className="relative rounded-lg overflow-hidden aspect-square bg-gray-100 border cursor-pointer group">
                          {photo?.preview ? (
                            <Image src={photo.preview} alt="preview" fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-400">
                              <Plus className="h-6 w-6" />
                            </div>
                          )}
                          {photo?.prompt && (
                            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-[10px] px-1 rounded">{photo.prompt}</div>
                          )}
                        </div>
                      </DialogTrigger>
                      <PhotoEditor index={i} data={photo} onSave={(data) => handleSavePhoto(i, data)} />
                    </Dialog>
                  ))}
                </div>
                <div className="text-xs text-gray-400">Tap to edit, drag to reorder</div>
              </div>
              {/* (Other sections like Match Note, Virtues, etc. can go here) */}
            </>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-sm text-gray-500 capitalize">{profile.type} Profile</p>
              </div>
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm">Just now</span>
                </div>
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm">A few seconds ago</span>
                </div>
              </div>
              <div className="pt-4">
                <Button
                  onClick={() => setMode('edit')}
                  className="w-full bg-pink-500 hover:bg-pink-600"
                >
                  Edit Profile
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
