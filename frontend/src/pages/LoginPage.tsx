import { LoginForm } from '@/components/auth/LoginForm';

export function LoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
