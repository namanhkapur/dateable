import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProfilePage } from '@/features/profile/components/ProfilePage';
import { LoginPage } from '@/features/auth/components/LoginForm';
import { LandingPage } from '@/features/landing/components/LandingPage';

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <MainLayout>
            <LandingPage />
          </MainLayout>
        } />
        <Route path="/login" element={
          <MainLayout>
            <LoginPage />
          </MainLayout>
        } />
        <Route path="/@:username" element={
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        } />
        <Route path="/profile" element={
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        } />
      </Routes>
    </Router>
  );
} 