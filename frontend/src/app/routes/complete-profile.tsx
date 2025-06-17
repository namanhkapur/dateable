import { CompleteProfileForm } from '@/features/auth/components/CompleteProfileForm';

export default function CompleteProfileRoute() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <CompleteProfileForm />
      </div>
    </div>
  );
} 