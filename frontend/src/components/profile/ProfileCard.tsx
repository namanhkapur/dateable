interface ProfileCardProps {
  title: string;
  createdBy: {
    name: string;
    avatar: string;
  };
  type: 'romantic' | 'roast' | 'bestie' | 'flirty';
  onClick?: () => void;
  bgColorClass?: string;
}

export function ProfileCard({ title, createdBy, type, onClick, bgColorClass = 'bg-card' }: ProfileCardProps) {
  return (
    <button
      onClick={onClick}
      className={`group relative flex h-[300px] flex-col overflow-hidden rounded-lg border ${bgColorClass} text-left transition-shadow hover:shadow-md`}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
            {type}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-semibold">{title}</h3>
        <div className="mt-auto flex items-center space-x-2">
          <img
            src={createdBy.avatar}
            alt={createdBy.name}
            className="h-6 w-6 rounded-full"
          />
          <span className="text-sm text-muted-foreground">
            Created by {createdBy.name}
          </span>
        </div>
      </div>
    </button>
  );
}
