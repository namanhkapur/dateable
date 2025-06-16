import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';

// Mock prompt data
const mockPrompts = [
  { id: '1', type: 'text', question: 'What is your favorite book?', answer: 'The Great Gatsby' },
  { id: '2', type: 'audio', question: 'Describe your perfect day', audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { id: '3', type: 'multi', question: 'Two Truths and a Lie', options: ['I have a twin', 'I speak 4 languages', 'I hate pizza'] },
  { id: '4', type: 'text', question: 'What is your dream vacation?', answer: 'Japan during cherry blossom season' },
];

type PromptType = 'all' | 'text' | 'audio' | 'multi';

export function PromptsLibraryDialog({ username }: { username: string }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<PromptType>('all');

  const filtered = tab === 'all' ? mockPrompts : mockPrompts.filter(p => p.type === tab);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="rounded-md bg-white text-black border px-4 py-2 text-sm font-medium shadow hover:bg-gray-100 transition-colors"
        >
          View All Prompts
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl w-full min-h-[400px] max-h-[80vh] flex flex-col">
        <DialogTitle>Prompts Library from {username}</DialogTitle>
        <Tabs value={tab} onValueChange={(v: string) => setTab(v as PromptType)} className="mt-4 flex-1 flex flex-col">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="text">Text</TabsTrigger>
            <TabsTrigger value="audio">Audio</TabsTrigger>
            <TabsTrigger value="multi">Multi</TabsTrigger>
          </TabsList>
          <TabsContent value={tab} className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 overflow-y-auto h-[40vh] items-start">
              {filtered.map(prompt => (
                <PromptCard key={prompt.id} prompt={prompt} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function PromptCard({ prompt }: { prompt: any }) {
  return (
    <div className="rounded-lg border p-4 bg-white shadow-sm hover:shadow-md transition-shadow h-full flex flex-col gap-2">
      <div className="font-semibold mb-1">{prompt.question}</div>
      {prompt.type === 'text' && (
        <div className="text-muted-foreground">{prompt.answer}</div>
      )}
      {prompt.type === 'audio' && (
        <audio controls src={prompt.audioUrl} className="w-full mt-2" />
      )}
      {prompt.type === 'multi' && (
        <ul className="list-disc pl-5 space-y-1">
          {prompt.options.map((opt: string, i: number) => (
            <li key={i}>{opt}</li>
          ))}
        </ul>
      )}
    </div>
  );
} 