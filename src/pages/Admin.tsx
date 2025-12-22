import React, { Suspense, lazy, useState } from 'react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';

const DataSync = lazy(() => import('../components/admin/DataSync').then((m) => ({ default: m.DataSync })));
const ArticleManager = lazy(() => import('../components/admin/ArticleManager').then((m) => ({ default: m.ArticleManager })));
const PortfolioManager = lazy(() => import('../components/admin/PortfolioManager').then((m) => ({ default: m.PortfolioManager })));
const NewsManager = lazy(() => import('../components/admin/NewsManager').then((m) => ({ default: m.NewsManager })));
const LinksManager = lazy(() => import('../components/admin/LinksManager').then((m) => ({ default: m.LinksManager })));
const DirectoryManager = lazy(() => import('../components/admin/DirectoryManager').then((m) => ({ default: m.DirectoryManager })));
const VaultManager = lazy(() => import('../components/admin/VaultManager').then((m) => ({ default: m.VaultManager })));
const TutorialsManager = lazy(() => import('../components/admin/TutorialsManager').then((m) => ({ default: m.TutorialsManager })));
const CollaboratorsManager = lazy(() => import('../components/admin/CollaboratorsManager').then((m) => ({ default: m.CollaboratorsManager })));
const CategoryManager = lazy(() => import('../components/admin/CategoryManager').then((m) => ({ default: m.CategoryManager })));
const SiteSettingsManager = lazy(() => import('../components/admin/SiteSettingsManager').then((m) => ({ default: m.SiteSettingsManager })));
const RedirectsManager = lazy(() => import('../components/admin/RedirectsManager').then((m) => ({ default: m.RedirectsManager })));
const AboutManager = lazy(() => import('../components/admin/AboutManager').then((m) => ({ default: m.AboutManager })));
const ResumeManager = lazy(() => import('../components/admin/ResumeManager').then((m) => ({ default: m.ResumeManager })));
const AnalyticsManager = lazy(() => import('../components/admin/AnalyticsManager').then((m) => ({ default: m.AnalyticsManager })));
const MediaManager = lazy(() => import('../components/admin/MediaManager').then((m) => ({ default: m.MediaManager })));
const ApiStatus = lazy(() => import('./admin/ApiStatus').then((m) => ({ default: m.ApiStatus })));
const ArchiveManager = lazy(() => import('../components/admin/ArchiveManager').then((m) => ({ default: m.ArchiveManager })));
const ModelsManager = lazy(() => import('../components/admin/ModelsManager').then((m) => ({ default: m.ModelsManager })));
const CRMManager = lazy(() => import('../components/admin/crm/CRMManager').then((m) => ({ default: m.CRMManager })));
const FinanceManager = lazy(() => import('../components/admin/finance/FinanceManager').then((m) => ({ default: m.FinanceManager })));

interface AdminProps {
  onNavigate: (page: string) => void;
}

type ManagerView = 'dashboard' | 'articles' | 'portfolio' | 'news' | 'links' | 'directory' | 'vault' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'api-status' | 'analytics' | 'redirects' | 'media' | 'data-sync' | 'contact' | 'archive' | 'models' | 'crm' | 'finance';

const navItems = [
  { id: 'dashboard', title: 'Dashboard' },
  { id: 'crm', title: 'Theatre CRM' },
  { id: 'finance', title: 'Finance & Hours' },
  { id: 'data-sync', title: 'Data Sync' },
  { id: 'analytics', title: 'Analytics' },
  { id: 'media', title: 'Media Manager' },
  { id: 'articles', title: 'Articles' },
  { id: 'portfolio', title: 'Portfolio' },
  { id: 'archive', title: '📸 Archive Gallery' },
  { id: 'models', title: '🏗️ Models Gallery' },
  { id: 'news', title: 'News' },
  { id: 'links', title: 'Social Links' },
  { id: 'directory', title: 'Scenic Directory' },
  { id: 'vault', title: 'Scenic Vault' },
  { id: 'tutorials', title: 'Tutorials' },
  { id: 'collaborators', title: 'Collaborators' },
  { id: 'categories', title: 'Categories' },
  { id: 'settings', title: 'Site Settings' },
  { id: 'redirects', title: 'Redirects' },
  { id: 'about', title: 'About Page' },
  { id: 'resume', title: 'Resume/CV' },
  { id: 'api-status', title: 'API Status' },
];

export function Admin({ onNavigate }: AdminProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState<ManagerView>('dashboard');

  React.useEffect(() => {
  }, [activeView]);

  // Check for existing session on mount
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        // Store both the Supabase token and the admin API token
        sessionStorage.setItem('supabase_token', session.access_token);
        // Generate admin token in the format the Edge Function expects: base64("admin:password")
        // Since we don't have the password here, we'll set a flag to generate it on login
        const existingAdminToken = sessionStorage.getItem('admin_token');
        if (!existingAdminToken) {
          // If no admin token exists, user needs to re-login
          setIsAuthenticated(false);
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Enforce admin token presence. If missing, user must re-login to generate it.
        const token = sessionStorage.getItem('admin_token');
        if (token) {
          setIsAuthenticated(true);
          sessionStorage.setItem('supabase_token', session.access_token);
        } else {
          console.warn('Session exists but admin token missing. Forcing re-login.');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
        sessionStorage.removeItem('supabase_token');
        sessionStorage.removeItem('admin_token');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        // Store Supabase session token
        sessionStorage.setItem('supabase_token', data.session.access_token);

        // Generate admin token in base64 format: base64("admin:password")
        // The Edge Function expects this format
        const adminToken = btoa(`admin:${password}`);
        sessionStorage.setItem('admin_token', adminToken);

        setIsAuthenticated(true);
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    sessionStorage.removeItem('admin_token');
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warm-500/10 border border-warm-500/30 rounded-3xl mb-4">
              <Lock className="w-8 h-8 text-warm-400" />
            </div>
            <h1 className="text-3xl tracking-tight mb-2 text-white">ADMIN ACCESS</h1>
            <p className="text-sm text-gray-400">Sign in with your email and password</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-400 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-warm-500 focus:outline-none transition-colors text-white placeholder:text-gray-500 relative z-10"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-0" />
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-12 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-warm-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none z-0" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors z-10"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-warm-600 text-white rounded-3xl text-xs tracking-wider uppercase hover:bg-warm-700 transition-colors disabled:opacity-50 shadow-lg shadow-warm-500/20"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <button
            onClick={() => onNavigate('home')}
            className="w-full mt-2 text-xs tracking-wider uppercase text-gray-500 hover:text-gray-300 transition-colors"
          >
            ← Back to Site
          </button>
        </div>
      </div>
    );
  }

  const getPageTitle = () => {
    const item = navItems.find(item => item.id === activeView);
    return item ? item.title : 'Dashboard';
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <AdminDashboard onSelectManager={setActiveView} />;
      case 'data-sync':
        return <DataSync />;
      case 'articles':
        return <ArticleManager />;
      case 'portfolio':
        return <PortfolioManager />;
      case 'news':
        return <NewsManager />;
      case 'links':
        return <LinksManager />;
      case 'directory':
        return <DirectoryManager />;
      case 'vault':
        return <VaultManager />;
      case 'tutorials':
        return <TutorialsManager />;
      case 'collaborators':
        return <CollaboratorsManager />;
      case 'categories':
        return <CategoryManager />;
      case 'settings':
        return <SiteSettingsManager />;
      case 'redirects':
        return <RedirectsManager />;
      case 'about':
        return <AboutManager />;
      case 'resume':
        return <ResumeManager />;
      case 'analytics':
        return <AnalyticsManager />;
      case 'media':
        return <MediaManager />;
      case 'api-status':
        return <ApiStatus />;
      case 'archive':
        return <ArchiveManager />;
      case 'models':
        return <ModelsManager />;
      case 'crm':
        return <CRMManager />;
      case 'finance':
        return <FinanceManager />;
      default:
        return <AdminDashboard onSelectManager={setActiveView} />;
    }
  };

  return (
    <SimpleErrorBoundary>
      <AdminLayout
        activeView={activeView}
        onNavigate={(view) => {
          setActiveView(view as ManagerView);
        }}
        onSiteNavigation={onNavigate}
        onLogout={handleLogout}
        pageTitle={getPageTitle()}
      >
        <Suspense fallback={<div className="p-6 text-sm text-gray-400">Loading admin panel...</div>}>
          {renderActiveView()}
        </Suspense>
      </AdminLayout>
    </SimpleErrorBoundary>
  );
}

// Ensure default export for lazy loading
export default Admin;
