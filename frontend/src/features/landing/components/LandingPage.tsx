import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const AlternativesPanel = ({
  isOpen,
  onClose,
  editingAsset,
  selectedProfile,
  onSelectAlternative,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingAsset: { type: 'photo' | 'text'; index: number } | null;
  selectedProfile: any;
  onSelectAlternative: (alt: any) => void;
}) => {
  if (!isOpen || !editingAsset) return null;

  const currentAsset = selectedProfile.assets[editingAsset.index];
  
  return (
    <div className="fixed top-0 right-0 h-full w-96 bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out"
         style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
      <div className="p-4 border-b flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {editingAsset.type === 'photo' ? 'Change Photo' : 'Change Prompt'}
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <div className="p-4 overflow-y-auto h-[calc(100%-60px)]">
        {editingAsset.type === 'photo' ? (
          <div className="grid grid-cols-2 gap-4">
            {[
              'https://picsum.photos/800/600?random=10',
              'https://picsum.photos/800/600?random=11',
              'https://picsum.photos/800/600?random=12',
              'https://picsum.photos/800/600?random=13',
              'https://picsum.photos/800/600?random=14',
            ].map((url, idx) => (
              <div 
                key={idx}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary"
                onClick={() => onSelectAlternative(url)}
              >
                <img 
                  src={url} 
                  alt={`Alternative ${idx + 1}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {currentAsset?.alternatives?.map((alt: any) => (
              <div 
                key={alt.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => onSelectAlternative(alt)}
              >
                <h4 className="font-medium text-gray-900 mb-1">{alt.question}</h4>
                <p className="text-gray-600">{alt.answer}</p>
              </div>
            ))}
            
            {currentAsset?.type === 'text' && (
              <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                <h4 className="font-medium text-gray-900 mb-1">
                  {currentAsset.question}
                </h4>
                <p className="text-gray-600">
                  {currentAsset.answer}
                </p>
                <div className="mt-2 text-xs text-primary">Current selection</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

type ProfileType = 'romantic' | 'roast' | 'bestie' | 'flirty';

interface Profile {
  id: string;
  title: string;
  type: ProfileType;
  createdBy: {
    name: string;
    avatar: string;
  };
  assets: Array<{
    id: string;
    type: string;
    url?: string;
    question?: string;
    answer?: string;
    answers?: string[];
    alternatives?: Array<{
      id: string;
      question: string;
      answer: string;
    }>;
  }>;
}

// Sample profile data for the card with mock assets
const sampleProfile: Profile = {
  id: 'sample-1',
  title: 'The Hopeless Romantic',
  type: 'romantic',
  createdBy: {
    name: 'Alex Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  assets: [
    // 6 photos
    {
      id: '1',
      type: 'photo',
      url: 'https://picsum.photos/800/600?random=1',
    },
    {
      id: '2',
      type: 'photo',
      url: 'https://picsum.photos/800/600?random=2',
    },
    {
      id: '3',
      type: 'photo',
      url: 'https://picsum.photos/800/600?random=3',
    },
    {
      id: '4',
      type: 'photo',
      url: 'https://picsum.photos/800/600?random=4',
    },
    {
      id: '5',
      type: 'photo',
      url: 'https://picsum.photos/800/600?random=5',
    },
    {
      id: '6',
      type: 'photo',
      url: 'https://picsum.photos/800/600?random=6',
    },
    // 3 prompts
    {
      id: 'p1',
      type: 'text',
      question: 'What are you looking for?',
      answer: 'Someone to share my love for sunsets and deep conversations',
      alternatives: [
        {
          id: 'p1-alt1',
          question: 'What are you looking for?',
          answer: 'A partner who loves hiking and outdoor adventures as much as I do',
        },
        {
          id: 'p1-alt2',
          question: 'What are you looking for?',
          answer: 'Someone who appreciates good food and great conversation',
        },
      ],
    },
    {
      id: 'p2',
      type: 'text',
      question: 'What makes a great relationship?',
      answer: 'Trust, communication, and a shared love for pizza',
      alternatives: [
        {
          id: 'p2-alt1',
          question: 'What makes a great relationship?',
          answer: 'Laughter, mutual respect, and never going to bed angry',
        },
        {
          id: 'p2-alt2',
          question: 'What makes a great relationship?',
          answer: 'Being each other\'s biggest cheerleaders and best friends',
        },
      ],
    },
    {
      id: 'p3',
      type: 'text',
      question: 'What are you passionate about?',
      answer: 'Traveling to new places and trying different cuisines',
      alternatives: [
        {
          id: 'p3-alt1',
          question: 'What are you passionate about?',
          answer: 'Photography and capturing life\'s beautiful moments',
        },
        {
          id: 'p3-alt2',
          question: 'What are you passionate about?',
          answer: 'Learning new skills and pushing myself out of my comfort zone',
        },
      ],
    },
  ],
};

export function LandingPage() {
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState<Profile>(sampleProfile);
  const [editingAsset, setEditingAsset] = useState<{ type: 'photo' | 'text'; index: number } | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  useEffect(() => {
    console.log('LandingPage mounted');
  }, []);

  const handleAssetClick = (type: 'photo' | 'text', index: number) => {
    console.log('Asset clicked:', { type, index });
    setEditingAsset({ type, index });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    console.log('Closing panel');
    setIsPanelOpen(false);
    setEditingAsset(null);
  };

  const handleSelectAlternative = (alternative: any) => {
    console.log('Alternative selected:', alternative);
    if (!editingAsset) return;
    
    const updatedAssets = [...selectedProfile.assets];
    const assetIndex = updatedAssets.findIndex(
      (asset, idx) => asset.type === editingAsset.type && idx === editingAsset.index
    );
    
    if (assetIndex !== -1) {
      if (editingAsset.type === 'photo') {
        updatedAssets[assetIndex] = { 
          ...updatedAssets[assetIndex], 
          url: alternative 
        };
      } else {
        updatedAssets[assetIndex] = {
          ...updatedAssets[assetIndex],
          question: alternative.question,
          answer: alternative.answer
        };
      }
      
      setSelectedProfile({
        ...selectedProfile,
        assets: updatedAssets,
      });
    }
    
    handleClosePanel();
  };

  console.log('Rendering LandingPage');

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white w-full overflow-hidden">
      {/* Main content area, centered under nav (assume nav is h-16 = 64px) */}
      <div className="flex items-center justify-center w-full" style={{height: 'calc(100vh - 4rem)'}}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              {/* Left side - Hero text */}
              <div className="text-center lg:text-left">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Your friend is <span className="underline decoration-primary">Dateable</span>.
                  <br />
                  They just need your help.
                </h1>
                <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
                  Create a Hinge profile for your friend 👫 so they can put their best 👞 forward. <span className="bg-yellow-100 px-1.5 py-0.5 rounded font-medium">We know, that mirror selfie has to go.</span>
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" onClick={() => navigate('/login')}>
                    Create a Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={() => navigate('/profile')}
                  >
                    Browse Profiles
                  </Button>
                </div>
              </div>

              {/* Right side - Profile View */}
              <div className="w-full flex justify-center">
                <div className="w-full max-w-xs lg:max-w-md">
                  <div className="bg-white rounded-xl shadow-xl overflow-hidden h-[90vh] max-h-[800px] w-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-6">
                      <h2 className="text-2xl font-bold mb-6">{selectedProfile.title}</h2>
                      
                      {/* Get all photos and prompts in order */}
                      {(() => {
                        const photos = selectedProfile.assets.filter(asset => asset.type === 'photo');
                        const prompts = selectedProfile.assets.filter(asset => asset.type === 'text');
                        const items = [];
                        
                        // Alternate between photo and prompt
                        const maxLength = Math.max(photos.length, prompts.length);
                        for (let i = 0; i < maxLength; i++) {
                          if (i < photos.length) {
                            items.push({ type: 'photo', data: photos[i] });
                          }
                          if (i < prompts.length) {
                            items.push({ type: 'text', data: prompts[i] });
                          }
                        }
                        
                        // Add the last two photos at the end if they exist
                        const remainingPhotos = photos.slice(maxLength);
                        if (remainingPhotos.length >= 2) {
                          items.push(
                            { type: 'photo', data: remainingPhotos[0] },
                            { type: 'photo', data: remainingPhotos[1] }
                          );
                        } else if (remainingPhotos.length === 1) {
                          items.push({ type: 'photo', data: remainingPhotos[0] });
                        }
                        
                        return items.map((item, index) => (
                          <div key={`${item.type}-${item.data.id}-${index}`} className="mb-6">
                            {item.type === 'photo' ? (
                              <div 
                                className="w-full aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => {
                                  const photoIndex = selectedProfile.assets.findIndex(asset => 
                                    asset.type === 'photo' && asset.id === item.data.id
                                  );
                                  handleAssetClick('photo', photoIndex);
                                }}
                              >
                                <img 
                                  src={item.data.url} 
                                  alt={`Profile ${index + 1}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div 
                                className="p-6 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors"
                                onClick={() => {
                                  const promptIndex = selectedProfile.assets.findIndex(asset => 
                                    asset.type === 'text' && asset.id === item.data.id
                                  );
                                  handleAssetClick('text', promptIndex);
                                }}
                              >
                                <h3 className="font-medium text-gray-900 mb-2">{item.data.question}</h3>
                                <p className="text-gray-600">{item.data.answer}</p>
                              </div>
                            )}
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Alternatives Side Panel */}
      <AlternativesPanel
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        editingAsset={editingAsset}
        selectedProfile={selectedProfile}
        onSelectAlternative={handleSelectAlternative}
      />
    </div>
  );
} 