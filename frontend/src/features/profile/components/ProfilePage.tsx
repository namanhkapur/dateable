import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProfileCard } from '@/features/profile/components/ProfileCard';
import { MediaLibraryDialog } from '@/features/profile/components/MediaLibraryDialog';
import { PromptsLibraryDialog } from '@/features/profile/components/PromptsLibraryDialog';
import { ProfileViewModal } from '@/features/profile/components/ProfileViewModal';

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

function getColorById(id: string) {
  // Simple hash to pick a color based on id
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return pastelColors[Math.abs(hash) % pastelColors.length];
}

type ProfileType = 'all' | 'romantic' | 'roast' | 'bestie' | 'flirty';

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
  const [activeFilter, setActiveFilter] = useState<ProfileType>('all');
  const isOwner = username === '@me'; // This will be replaced with actual auth logic
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);

  const filters: ProfileType[] = ['all', 'romantic', 'roast', 'bestie', 'flirty'];

  const filteredProfiles = activeFilter === 'all' 
    ? mockProfiles 
    : mockProfiles.filter(profile => profile.type === activeFilter);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">
          {isOwner ? 'Welcome back, Namanh!' : `Viewing ${username}'s Dateable`}
        </h1>
        <p className="text-muted-foreground">
          {isOwner
            ? 'You have 5 profiles and 3 invites waiting'
            : 'Create a profile for your friend'}
        </p>
      </div>

      {/* Filter Tabs and Action Buttons Row */}
      <div className="flex items-center justify-between pb-2">
        {/* Filter Tabs */}
        <div className="flex space-x-2 overflow-x-auto">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors
                ${
                  activeFilter === filter
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted hover:bg-muted/80'
                }`}
            >
              {filter}
            </button>
          ))}
        </div>
        {/* Action Buttons */}
        {!isOwner && (
          <div className="flex gap-2 ml-4">
            <MediaLibraryDialog username={username || 'user'} />
            <PromptsLibraryDialog username={username || 'user'} />
          </div>
        )}
      </div>

      {/* Profile Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Create Card for non-owners */}
        {!isOwner && (
          <button className="flex h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 p-6 hover:border-primary">
            <div className="text-center">
              <div className="text-4xl">+</div>
              <p className="mt-2 text-sm text-muted-foreground">Create Profile</p>
            </div>
          </button>
        )}

        {/* Mock Profile Cards */}
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
        {/* Profile View Modal (Hinge-style) */}
        {openProfileId && (
          <ProfileViewModal
            isOwner={false}
            profile={mockProfiles.find(p => p.id === openProfileId)}
            onClose={() => setOpenProfileId(null)}
          />
        )}
      </div>
    </div>
  );
} 