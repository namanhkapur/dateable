import { useLocation, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/features/auth/api/auth';
import { Button } from '@/components/ui/button';

export function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { supabaseUser, clearSession } = useAuth();
  const isLoginPage = location.pathname === '/';

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      clearSession();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <button 
              className="mr-6 flex items-center space-x-2" 
              onClick={() => navigate(supabaseUser ? '/home' : '/')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="currentColor"/>
                <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" fill="white"/>
              </svg>
              <span className="font-bold">Dateable</span>
            </button>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <nav className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/home/profile')}
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                My Profile
              </button>
            </nav>
            {!isLoginPage && (
              <div className="w-full flex-1 md:w-auto md:flex-none">
                {supabaseUser ? (
                  <Button 
                    variant="destructive" 
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sign Out
                  </Button>
                ) : (
                  <a 
                    href="/#/"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                  >
                    Login
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container py-6">
        <div className="relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
} 