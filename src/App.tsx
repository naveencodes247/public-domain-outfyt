import React from 'react';
import { RouterProvider, useLocation } from './router/Router';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';

// Public Pages
import HomePage from './pages/HomePage';
import DiscoverPage from './pages/DiscoverPage';
import CategoriesPage from './pages/CategoriesPage';
import SearchPage from './pages/SearchPage';
import OutfitDetailPage from './pages/OutfitDetailPage';
import AboutPage from './pages/AboutPage';
import AffiliateDisclosurePage from './pages/AffiliateDisclosurePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Pages
import AdminRouteGuard from './components/admin/AdminRouteGuard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminOutfitsPage from './pages/admin/AdminOutfitsPage';
import AdminOutfitEditorPage from './pages/admin/AdminOutfitEditorPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function AppContent() {
  const { pathname } = useLocation();

  const renderCurrentPage = () => {
    // 1. Homepage
    if (pathname === '/' || pathname === '') {
      return <HomePage />;
    }

    // 2. Public Catalog & Discovery
    if (pathname === '/discover') {
      return <DiscoverPage />;
    }
    if (pathname === '/categories') {
      return <CategoriesPage />;
    }
    if (pathname === '/search') {
      return <SearchPage />;
    }

    // 3. Outfit Detail Page: /outfit/:slug or /outfit/:id
    if (pathname.startsWith('/outfit/')) {
      return <OutfitDetailPage />;
    }

    // 4. Institutional & Legal
    if (pathname === '/about') {
      return <AboutPage />;
    }
    if (pathname === '/affiliate-disclosure') {
      return <AffiliateDisclosurePage />;
    }
    if (pathname === '/privacy') {
      return <PrivacyPolicyPage />;
    }
    if (pathname === '/terms') {
      return <TermsPage />;
    }
    if (pathname === '/contact') {
      return <ContactPage />;
    }

    // 5. Admin Protected Routes
    if (pathname === '/admin') {
      return (
        <AdminRouteGuard>
          <AdminDashboard />
        </AdminRouteGuard>
      );
    }
    if (pathname === '/admin/outfits') {
      return (
        <AdminRouteGuard>
          <AdminOutfitsPage />
        </AdminRouteGuard>
      );
    }
    if (pathname === '/admin/outfits/new') {
      return (
        <AdminRouteGuard>
          <AdminOutfitEditorPage />
        </AdminRouteGuard>
      );
    }
    if (pathname.startsWith('/admin/outfits/') && pathname.endsWith('/edit')) {
      return (
        <AdminRouteGuard>
          <AdminOutfitEditorPage />
        </AdminRouteGuard>
      );
    }
    if (pathname === '/admin/settings') {
      return (
        <AdminRouteGuard>
          <AdminSettingsPage />
        </AdminRouteGuard>
      );
    }

    // Fallback: 404 Not Found
    return <NotFoundPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EB] text-[#171717] selection:bg-[#CDA66B] selection:text-[#171717]">
      <Header />
      <main className="flex-1 w-full">
        {renderCurrentPage()}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AppContent />
    </RouterProvider>
  );
}
