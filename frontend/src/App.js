import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './context/ThemeContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import ScrollToTop from './components/common/ScrollToTop';
import Navbar from './components/layout/Navbar';
import BottomBar from './components/layout/BottomBar';
import Footer from './components/layout/Footer';

import HomePage          from './pages/HomePage';
import ListingsPage      from './pages/ListingsPage';
import ListingDetailPage from './pages/ListingDetailPage';
import MapPage           from './pages/MapPage';
import ContactPage       from './pages/ContactPage';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import AdminDashboard    from './pages/AdminDashboard';
import BusinessDashboard from './pages/BusinessDashboard';

import './styles/global.css';

const FULL_SCREEN_PATHS = ['/admin', '/business', '/login', '/register'];

function AppShell() {
  const location = useLocation();
  const isFullScreen = FULL_SCREEN_PATHS.some(p => location.pathname.startsWith(p));

  return (
    <>
      {!isFullScreen && <Navbar />}
      <main key={location.pathname} style={{ minHeight: isFullScreen ? '100vh' : 'auto' }}>
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/listings"       element={<ListingsPage />} />
          <Route path="/listings/:slug" element={<ListingDetailPage />} />
          <Route path="/map"            element={<MapPage />} />
          <Route path="/contact"        element={<ContactPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/register"       element={<RegisterPage />} />

          <Route path="/admin/*" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="/business" element={
            <ProtectedRoute roles={['business']}>
              <BusinessDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={
            <div style={{
              minHeight:'100vh', display:'flex', flexDirection:'column',
              alignItems:'center', justifyContent:'center', gap:16,
              paddingTop:'var(--nav-height)',
            }}>
              <span style={{ fontSize:64 }}>🏔</span>
              <h1 style={{ fontSize:32, fontFamily:'var(--font-display)' }}>404</h1>
              <p style={{ color:'var(--gray-500)' }}>Page not found</p>
              <a href="/" className="btn btn-primary">Go home</a>
            </div>
          } />
        </Routes>
      </main>
      {!isFullScreen && <Footer />}
      {!isFullScreen && <BottomBar />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <ThemeProvider>
          <AuthProvider>
            <ScrollToTop />
            <AppShell />
          </AuthProvider>
        </ThemeProvider>
      </I18nProvider>
    </BrowserRouter>
  );
}
