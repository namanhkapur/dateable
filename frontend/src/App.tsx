import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { ProfilePage } from './pages/ProfilePage';

export function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/@:username" element={<ProfilePage />} />
          <Route path="/" element={<ProfilePage />} />
        </Routes>
      </MainLayout>
    </Router>
  );
} 