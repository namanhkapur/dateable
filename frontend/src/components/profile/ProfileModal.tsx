import { useState } from 'react';
import type { ReactNode } from 'react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  isCreator: boolean;
  profile: {
    title: string;
    type: 'romantic' | 'roast' | 'bestie' | 'flirty';
    photos: string[];
    prompts: Array<{
      question: string;
      answer: string;
    }>;
    twoTruthsAndLie: string[];
    voicePrompt?: string;
    identity: {
      job: string;
      education: string;
      religion: string;
      politics: string;
      gender: string;
      sexuality: string;
      intentions: string;
    };
  };
}

export function ProfileModal({ isOpen, onClose, isCreator, profile }: ProfileModalProps) {
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative h-full w-full max-w-3xl overflow-y-auto bg-background p-6 shadow-lg">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">{profile.title}</h2>
            <button
              onClick={onClose}
              className="rounded-full p-2 hover:bg-muted"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex space-x-4 border-b">
            <button
              onClick={() => setActiveTab('view')}
              className={`border-b-2 px-4 py-2 ${
                activeTab === 'view'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              View
            </button>
            {isCreator && (
              <button
                onClick={() => setActiveTab('edit')}
                className={`border-b-2 px-4 py-2 ${
                  activeTab === 'edit'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                Edit
              </button>
            )}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {activeTab === 'view' ? (
              <ViewTab profile={profile} />
            ) : (
              <EditTab profile={profile} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ViewTab({ profile }: { profile: ProfileModalProps['profile'] }) {
  return (
    <div className="space-y-6">
      {/* Photo Gallery */}
      <div className="grid grid-cols-2 gap-4">
        {profile.photos.map((photo, index) => (
          <img
            key={index}
            src={photo}
            alt={`Profile photo ${index + 1}`}
            className="aspect-square rounded-lg object-cover"
          />
        ))}
      </div>

      {/* Prompts */}
      <div className="space-y-4">
        {profile.prompts.map((prompt, index) => (
          <div key={index} className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">{prompt.question}</h3>
            <p className="text-muted-foreground">{prompt.answer}</p>
          </div>
        ))}
      </div>

      {/* Two Truths and a Lie */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Two Truths and a Lie</h3>
        <div className="space-y-2">
          {profile.twoTruthsAndLie.map((statement, index) => (
            <div key={index} className="rounded-lg border p-3">
              {statement}
            </div>
          ))}
        </div>
      </div>

      {/* Identity */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">About Me</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(profile.identity).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <p className="text-sm text-muted-foreground capitalize">{key}</p>
              <p>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EditTab({ profile }: { profile: ProfileModalProps['profile'] }) {
  return (
    <div className="space-y-6">
      {/* Photo Editor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">My Photos & Videos</h3>
        <div className="grid grid-cols-2 gap-4">
          {profile.photos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photo}
                alt={`Profile photo ${index + 1}`}
                className="h-full w-full rounded-lg object-cover"
              />
              <button className="absolute right-2 top-2 rounded-full bg-background/80 p-1 hover:bg-background">
                ✕
              </button>
            </div>
          ))}
          <button className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary">
            <div className="text-center">
              <div className="text-2xl">+</div>
              <p className="mt-1 text-sm text-muted-foreground">Add Photo</p>
            </div>
          </button>
        </div>
      </div>

      {/* Prompt Editor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Written Prompts</h3>
        <div className="space-y-4">
          {profile.prompts.map((prompt, index) => (
            <div key={index} className="space-y-2">
              <input
                type="text"
                value={prompt.question}
                className="w-full rounded-md border p-2"
                placeholder="Enter prompt question"
              />
              <textarea
                value={prompt.answer}
                className="w-full rounded-md border p-2"
                placeholder="Enter your answer"
                rows={3}
              />
            </div>
          ))}
          <button className="w-full rounded-md border p-2 text-muted-foreground hover:bg-muted">
            + Add Prompt
          </button>
        </div>
      </div>

      {/* Two Truths and a Lie Editor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Two Truths and a Lie</h3>
        <div className="space-y-2">
          {profile.twoTruthsAndLie.map((statement, index) => (
            <input
              key={index}
              type="text"
              value={statement}
              className="w-full rounded-md border p-2"
              placeholder={`Statement ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Identity Editor */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Identity & Preferences</h3>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(profile.identity).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <label className="text-sm text-muted-foreground capitalize">
                {key}
              </label>
              <input
                type="text"
                value={value}
                className="w-full rounded-md border p-2"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        Save Changes
      </button>
    </div>
  );
} 