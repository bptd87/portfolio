import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { AdminLayout } from '../components/admin/AdminLayout';
import { AdminDashboard } from '../components/admin/AdminDashboard';
import { ArticleManager } from '../components/admin/ArticleManager';
import { PortfolioManager } from '../components/admin/PortfolioManager';
import { NewsManager } from '../components/admin/NewsManager';
import { LinksManager } from '../components/admin/LinksManager';
import { DirectoryManager } from '../components/admin/DirectoryManager';
import { VaultManager } from '../components/admin/VaultManager';
import { TutorialsManager } from '../components/admin/TutorialsManager';
import { CollaboratorsManager } from '../components/admin/CollaboratorsManager';
import { CategoryManager } from '../components/admin/CategoryManager';
import { SiteSettingsManager } from '../components/admin/SiteSettingsManager';
import { AboutManager } from '../components/admin/AboutManager';
import { ResumeManager } from '../components/admin/ResumeManager';
import { AnalyticsManager } from '../components/admin/AnalyticsManager';
import { RedirectsManager } from '../components/admin/RedirectsManager';
import { MediaManager } from '../components/admin/MediaManager';
import { DataSync } from '../components/admin/DataSync';
import { ApiStatus } from './admin/ApiStatus';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';
import { ArchiveManager } from '../components/admin/ArchiveManager';
import { ModelsManager } from '../components/admin/ModelsManager';
import { CRMManager } from '../components/admin/crm/CRMManager';
import { FinanceManager } from '../components/admin/finance/FinanceManager';

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

  // Check for existing session on mount
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_token', session.access_token);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session) {
        sessionStorage.setItem('admin_token', session.access_token);
      } else {
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
        sessionStorage.setItem('admin_token', data.session.access_token);
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
    <div className="min-h-screen bg-gray-950 text-white">
      <SimpleErrorBoundary>
        <AdminLayout
          activeView={activeView}
          onNavigate={(view) => setActiveView(view as ManagerView)}
          onSiteNavigation={onNavigate}
          onLogout={handleLogout}
          pageTitle={getPageTitle()}
        >
          {renderActiveView()}
        </AdminLayout>
      </SimpleErrorBoundary>
    </div>
  );
}
