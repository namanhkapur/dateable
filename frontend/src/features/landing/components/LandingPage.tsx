import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth/context/AuthContext';

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
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close panel when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Always render the panel but keep it hidden when closed to prevent animation glitch
  const currentAsset = editingAsset ? selectedProfile.assets[editingAsset.index] : null;
  
  if (!isOpen || !editingAsset || !currentAsset) {
    return (
      <div 
        className="fixed top-16 bottom-0 right-0 left-1/2 bg-white shadow-lg z-40 transform translate-x-full"
        style={{ pointerEvents: 'none' }}
      />
    );
  }
  
  return (
    <div 
      ref={panelRef}
      className={`fixed top-16 bottom-0 right-0 left-1/2 bg-white shadow-lg z-40 transform transition-all duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4 overflow-y-auto h-full">
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
            {[
              // Current selection first
              {
                ...currentAsset,
                id: 'current-selection',
                isCurrent: true
              },
              // Then the rest of the alternatives
              ...(currentAsset?.alternatives?.filter((alt: any) => 
                alt.answer !== currentAsset.answer || alt.question !== currentAsset.question
              ) || [])
            ].map((alt: any) => (
              <div 
                key={alt.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  alt.isCurrent 
                    ? 'border-2 border-primary bg-primary/5' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => !alt.isCurrent && onSelectAlternative(alt)}
              >
                <h4 className="font-medium text-gray-900 mb-1">
                  {alt.question}
                  {alt.isCurrent && (
                    <span className="ml-2 text-xs text-primary">Current selection</span>
                  )}
                </h4>
                <p className="text-gray-600">{alt.answer}</p>
              </div>
            ))}
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
  const { supabaseUser, serverUser, loading } = useAuth();
  const [selectedProfile, setSelectedProfile] = useState<Profile>(sampleProfile);
  const [editingAsset, setEditingAsset] = useState<{ type: 'photo' | 'text'; index: number } | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  
  useEffect(() => {
    console.log('LandingPage mounted');
  }, []);

  const handleCreateProfile = () => {
    // Don't do anything while auth is still loading
    if (loading) {
      return;
    }
    
    if (supabaseUser && serverUser !== undefined) {
      // User is authenticated and we have profile data
      if (serverUser?.username) {
        navigate(`/profile/${serverUser.username}`);
      } else {
        // User doesn't have username yet, redirect to complete profile
        navigate('/complete-profile');
      }
    } else {
      // User is not authenticated, redirect to login
      navigate('/login');
    }
  };


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
    
    setSelectedProfile(prev => {
      const updatedAssets = [...prev.assets];
      const assetIndex = editingAsset.index;
      
      if (updatedAssets[assetIndex]) {
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
      }
      
      return {
        ...prev,
        assets: updatedAssets,
      };
    });
    
    handleClosePanel();
  };


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
                  <Button size="lg" onClick={handleCreateProfile} disabled={loading}>
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Loading...
                      </div>
                    ) : (
                      "Create a Profile"
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    disabled
                    // onClick intentionally omitted while feature is disabled
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