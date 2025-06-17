import { Asset } from '@/components/profile/MediaCard';

export const MOCK_USER_MEDIA: Asset[] = [
  {
    id: '1',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    question: 'This is me in my element',
    answer: 'Hiking in the mountains',
  },
  {
    id: '2',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    question: 'My perfect weekend',
    answer: 'Relaxing with a good book',
  },
  {
    id: '3',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    question: 'My happy place',
    answer: 'At the beach with friends',
  },
  {
    id: '4',
    type: 'video',
    url: 'https://example.com/video1.mp4',
    question: 'Watch me in action',
    answer: 'Playing guitar',
  },
  {
    id: '5',
    type: 'photo',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    question: 'My favorite hobby',
    answer: 'Photography',
  },
];
