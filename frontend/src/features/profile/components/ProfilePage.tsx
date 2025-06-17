import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { ProfileCard } from '@/features/profile/components/ProfileCard';
import { MediaLibraryDialog } from '@/features/profile/components/MediaLibraryDialog';
import { PromptsLibraryDialog } from '@/features/profile/components/PromptsLibraryDialog';
import { ProfileViewModal } from '@/features/profile/components/ProfileViewModal';
import { HingeProfileModal } from './HingeProfileModal';
import { useSessionData } from '@/features/auth/hooks/useSessionData';
import { userApi } from '@/features/auth/api/user';

// Pastel/neutral Tailwind color classes
const pastelColors = [
  'bg-pink-100',
  'bg-blue-100',
  'bg-green-100',
  'bg-yellow-100',
  'bg-purple-100',
  'bg-orange-100',
  'bg-teal-100',
  'bg-gray-100',
  'bg-indigo-100',
  'bg-rose-100',
  'bg-lime-100',
  'bg-fuchsia-100',
];

const getColorById = (id: string) => {
  const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return pastelColors[hash % pastelColors.length];
};

// Mock data for demonstration (with dummy photos and prompts)
const mockProfiles = [
  {
    id: '1',
    title: 'The Hopeless Romantic',
    type: 'romantic' as const,
    createdBy: {
      name: 'Sarah',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'
    },
    assets: [
      // 6 media
      { id: 'a1', type: 'photo', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80' },
      { id: 'a2', type: 'photo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
      { id: 'a3', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 10 },
      { id: 'a4', type: 'photo', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80' },
      { id: 'a5', type: 'photo', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80' },
      { id: 'a6', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', duration: 5 },
      // 3 prompts
      { id: 'a7', type: 'multi', question: 'Two truths and a lie', options: [
        'I took 15 weeks of paid vacation last year',
        'I beatboxed for an a cappella team in college',
        'My cat speaks both Hindi and English',
      ] },
      { id: 'a8', type: 'text', question: 'What if I told you that', answer: 'I make short films in my free time and one got 5M views IG: @namanhkapur' },
      { id: 'a9', type: 'audio', question: 'Describe your perfect day', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    ],
  },
  {
    id: '2',
    title: 'The Savage Roast',
    type: 'roast' as const,
    createdBy: {
      name: 'Mike',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike'
    },
    assets: [
      // 6 media
      { id: 'b1', type: 'photo', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80' },
      { id: 'b2', type: 'photo', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80' },
      { id: 'b3', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', duration: 8 },
      { id: 'b4', type: 'photo', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80' },
      { id: 'b5', type: 'photo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
      { id: 'b6', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 12 },
      // 3 prompts
      { id: 'b7', type: 'text', question: 'My best roast', answer: 'You have the personality of a dial tone.' },
      { id: 'b8', type: 'multi', question: 'Two truths and a lie', options: [
        'I once roasted my boss in front of the whole company',
        'I can eat 10 hot wings in 2 minutes',
        'I have never lost a roast battle',
      ] },
      { id: 'b9', type: 'audio', question: 'Roast in audio', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    ],
  },
  {
    id: '3',
    title: 'Best Friend Forever',
    type: 'bestie' as const,
    createdBy: {
      name: 'Emma',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma'
    },
    assets: [
      // 6 media
      { id: 'c1', type: 'photo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
      { id: 'c2', type: 'photo', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80' },
      { id: 'c3', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', duration: 7 },
      { id: 'c4', type: 'photo', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80' },
      { id: 'c5', type: 'photo', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80' },
      { id: 'c6', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 9 },
      // 3 prompts
      { id: 'c7', type: 'text', question: 'Bestie moment', answer: 'Road trip to the Grand Canyon.' },
      { id: 'c8', type: 'multi', question: 'Two truths and a lie', options: [
        'I have a twin',
        'I speak 4 languages',
        'I hate pizza',
      ] },
      { id: 'c9', type: 'audio', question: 'Best friend audio', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    ],
  },
  {
    id: '4',
    title: 'The Flirt Master',
    type: 'flirty' as const,
    createdBy: {
      name: 'Alex',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex'
    },
    assets: [
      // 6 media
      { id: 'd1', type: 'photo', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=600&q=80' },
      { id: 'd2', type: 'photo', url: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=600&q=80' },
      { id: 'd3', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', duration: 6 },
      { id: 'd4', type: 'photo', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80' },
      { id: 'd5', type: 'photo', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80' },
      { id: 'd6', type: 'video', url: 'https://www.w3schools.com/html/movie.mp4', duration: 11 },
      // 3 prompts
      { id: 'd7', type: 'text', question: 'Pick up line', answer: 'Are you a magician? Because whenever I look at you, everyone else disappears.' },
      { id: 'd8', type: 'multi', question: 'Two truths and a lie', options: [
        'I once got 100 matches in a day',
        'I can cook a 5-course meal',
        'I have never been on a bad date',
      ] },
      { id: 'd9', type: 'audio', question: 'Flirty audio', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    ],
  },
];

export function ProfilePage() {
  const { username } = useParams();
  const { userName, userId } = useSessionData();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileUser = async () => {
      if (!username) {
        setError('Username not provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await userApi.getUser({ username });
        
        if (response.success && response.user) {
          setProfileUser(response.user);
          
          // Check if this is the current user's own profile
          setIsOwner(response.user.id === userId);
        } else {
          setError('User not found');
        }
      } catch (err) {
        console.error('Error fetching profile user:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileUser();
  }, [username, userId]);

  // Show all profiles without filtering
  const filteredProfiles = mockProfiles;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile not found</h2>
          <p className="text-muted-foreground mb-4">
            {error || 'The user you are looking for does not exist.'}
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Go back home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
            <span>😊</span>
          </div>
          <h1 className="text-2xl font-bold">
            {isOwner ? `Welcome back, ${profileUser.name}!` : `Viewing ${profileUser.name}'s Dateable`}
          </h1>
        </div>
        <p className="text-muted-foreground">
          {isOwner
            ? 'Create your first profile'
            : 'Create a profile for your friend'}
        </p>
      </div>

      {/* Action Buttons Row */}
      {!isOwner && (
        <div className="flex justify-end pb-2">
          <div className="flex gap-2">
            <MediaLibraryDialog username={profileUser.name} />
            <PromptsLibraryDialog username={profileUser.name} />
          </div>
        </div>
      )}

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create Card for non-owners */}
        {!isOwner && (
          <div
            className="cursor-pointer rounded-xl border-2 border-dashed border-gray-300 p-6 flex flex-col items-center justify-center hover:border-[#7c2e9a] transition-colors"
            onClick={() => setShowProfileModal(true)}
          >
            <span className="text-4xl mb-2">+</span>
            <span className="font-semibold">Create Profile</span>
          </div>
        )}

        {/* Profile Cards */}
        {filteredProfiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            title={profile.title}
            type={profile.type}
            createdBy={profile.createdBy}
            bgColorClass={getColorById(profile.id)}
            onClick={() => setOpenProfileId(profile.id)}
          />
        ))}
      </div>

      {/* Hinge-Style Profile Modal */}
      <HingeProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        profileName={profileUser.name}
      />
    </div>
  );
}