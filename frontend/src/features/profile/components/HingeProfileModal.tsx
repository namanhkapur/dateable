import { useState } from 'react';
import { X, ChevronRight, Plus } from 'lucide-react';
import { PhotoSection } from './PhotoEditor';

interface HingeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileName: string;
}

const VIRTUES = [
  { label: 'Work', value: 'LinkedIn', visible: true },
  { label: 'Job Title', value: 'Software Engineer', visible: true },
  { label: 'School', value: 'Rice University', visible: true },
  { label: 'Education Level', value: '', visible: false, alwaysHidden: true },
  { label: 'Religious Beliefs', value: '', visible: false },
  { label: 'Hometown', value: 'Houston, TX', visible: true },
  { label: 'Politics', value: '', visible: false },
  { label: 'Languages Spoken', value: 'English, Hindi, French, Portuguese', visible: true },
  { label: 'Dating Intentions', value: 'Long-term relationship', visible: false },
  { label: 'Relationship Type', value: 'Monogamy', visible: false },
];

const IDENTITY = [
  { label: 'Pronouns', value: 'None', visible: false },
  { label: 'Gender', value: 'Man', visible: false },
  { label: 'Sexuality', value: 'Straight', visible: false },
  { label: 'I\'m interested in', value: 'Women', visible: false, alwaysHidden: true },
];



// Using PhotoEditor from './PhotoEditor'.



export function HingeProfileModal({ isOpen, onClose, profileName }: HingeProfileModalProps) {
  const [tab, setTab] = useState<'edit' | 'view'>('edit');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
        {/* Fixed Header */}
        <div className="flex-none">
          {/* Top Bar */}
          <div className="px-4 pt-4 pb-2 border-b">
            <div className="flex items-center justify-between">
              <button 
                onClick={onClose}
                className="text-[#7c2e9a] text-sm font-medium"
              >
                Cancel
              </button>
              <div className="text-sm font-semibold">{profileName}</div>
              <button 
                onClick={onClose}
                className="text-[#7c2e9a] text-sm font-medium"
              >
                Done
              </button>
            </div>
          </div>
          {/* Tab Switcher */}
          <div className="relative border-b">
            <div className="flex items-center px-4 pt-2 pb-1 relative">
              <button
                className={`flex-1 py-2 text-sm font-medium relative ${tab === 'edit' ? 'text-[#7c2e9a]' : 'text-gray-500'}`}
                onClick={() => setTab('edit')}
              >
                <div className="relative">
                  <div className="py-2">Edit</div>
                  {tab === 'edit' && (
                    <div className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#7c2e9a]"></div>
                  )}
                </div>
              </button>
              <button
                className={`flex-1 py-2 text-sm font-medium relative ${tab === 'view' ? 'text-[#7c2e9a]' : 'text-gray-500'}`}
                onClick={() => setTab('view')}
              >
                <div className="relative">
                  <div className="py-2">View</div>
                  {tab === 'view' && (
                    <div className="absolute bottom-[-17px] left-0 right-0 h-[2px] bg-[#7c2e9a]"></div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            {tab === 'edit' ? (
              <>
                <PhotoSection />
                {/* Section: Match Note */}
                <div className="mt-3">
                  <div className="text-xs font-bold text-[#7c2e9a] mb-1">Match Note</div>
                  <div className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="text-sm font-medium">Match Note</div>
                      <div className="text-xs text-gray-400">None</div>
                    </div>
                    <div className="text-xs text-gray-400 mr-2">Hidden</div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
                {/* Section: My Virtues */}
              <div className="mt-6">
                <div className="text-xs font-bold text-gray-500 mb-1">My Virtues</div>
                {VIRTUES.map((item, idx) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      {item.value && <div className="text-xs text-gray-400">{item.value}</div>}
                    </div>
                    <div className={`text-xs mr-2 ${item.alwaysHidden ? 'text-gray-400' : item.visible ? 'text-[#7c2e9a]' : 'text-gray-400'}`}>{item.alwaysHidden ? 'Always Hidden' : item.visible ? 'Visible' : 'Hidden'}</div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
              {/* Section: Identity */}
              <div className="mt-6">
                <div className="text-xs font-bold text-gray-500 mb-1">Identity</div>
                {IDENTITY.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b">
                    <div>
                      <div className="text-sm font-medium">{item.label}</div>
                      {item.value && <div className="text-xs text-gray-400">{item.value}</div>}
                    </div>
                    <div className={`text-xs mr-2 ${item.alwaysHidden ? 'text-gray-400' : item.visible ? 'text-[#7c2e9a]' : 'text-gray-400'}`}>{item.alwaysHidden ? 'Always Hidden' : item.visible ? 'Visible' : 'Hidden'}</div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                ))}
              </div>
              {/* Section: Prompts, Photos, etc. */}
              <div className="mt-6">
                <div className="text-xs font-bold text-gray-500 mb-1">Prompt Poll (1)</div>
                <div className="bg-gray-100 rounded-lg p-3 mb-2">
                  <div className="text-sm font-medium mb-1">Two truths and a lie</div>
                  <div className="space-y-1">
                    <div className="bg-white rounded-lg px-2 py-1 text-xs border">I took 15 weeks of paid vacation last year</div>
                    <div className="bg-white rounded-lg px-2 py-1 text-xs border">I beatboxed for an a cappella team in coll...</div>
                    <div className="bg-white rounded-lg px-2 py-1 text-xs border">My cat speaks both Hindi and English</div>
                  </div>
                  <button className="absolute top-2 right-2"><X className="h-4 w-4 text-gray-400" /></button>
                </div>
                <div className="text-xs font-bold text-gray-500 mb-1 mt-4">Voice Prompt (1)</div>
                <div className="border-2 border-dashed rounded-lg p-3 flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span>Select a Prompt<br /><span className="text-xs">And record your answer</span></span>
                  <button><Plus className="h-4 w-4 text-[#7c2e9a]" /></button>
                </div>
              </div>
              </>
            ) : (
              <>
                <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <Plus className="h-12 w-12 mx-auto mb-2" />
                      <span className="text-sm">Add Photo</span>
                    </div>
                  </div>
                </div>
                {/* Section: Match Note */}
                <div className="mt-3">
                  <div className="text-xs font-bold text-[#7c2e9a] mb-1">Match Note</div>
                  <div className="py-2 border-b">
                    <div className="text-sm text-gray-500">No match note added</div>
                  </div>
                </div>
                {/* Section: My Virtues */}
                <div className="mt-6">
                  <div className="text-xs font-bold text-gray-500 mb-1">My Virtues</div>
                  {VIRTUES.filter(item => item.visible).map((item) => (
                    <div key={item.label} className="py-2 border-b">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.value || 'Not specified'}</div>
                    </div>
                  ))}
                </div>
                {/* Section: Identity */}
                <div className="mt-6">
                  <div className="text-xs font-bold text-gray-500 mb-1">Identity</div>
                  {IDENTITY.filter(item => item.visible).map((item) => (
                    <div key={item.label} className="py-2 border-b">
                      <div className="text-sm font-medium">{item.label}</div>
                      <div className="text-xs text-gray-500">{item.value || 'Not specified'}</div>
                    </div>
                  ))}
                </div>
                {/* Section: Prompts */}
                <div className="mt-6">
                  <div className="text-xs font-bold text-gray-500 mb-1">Prompt Poll</div>
                  <div className="bg-gray-100 rounded-lg p-3 mb-2">
                    <div className="text-sm font-medium mb-1">Two truths and a lie</div>
                    <div className="space-y-1">
                      <div className="bg-white rounded-lg px-2 py-1 text-xs">I took 15 weeks of paid vacation last year</div>
                      <div className="bg-white rounded-lg px-2 py-1 text-xs">I beatboxed for an a cappella team in college</div>
                      <div className="bg-white rounded-lg px-2 py-1 text-xs">My cat speaks both Hindi and English</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
