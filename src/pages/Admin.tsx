import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
import { ApiStatus } from './admin/ApiStatus';
import { SimpleErrorBoundary } from '../components/SimpleErrorBoundary';

interface AdminProps {
  onNavigate: (page: string) => void;
}

type ManagerView = 'dashboard' | 'articles' | 'portfolio' | 'news' | 'links' | 'directory' | 'vault' | 'tutorials' | 'collaborators' | 'categories' | 'settings' | 'about' | 'resume' | 'api-status' | 'analytics' | 'redirects' | 'media';

const navItems = [
  { id: 'dashboard', title: 'Dashboard' },
  { id: 'analytics', title: 'Analytics' },
  { id: 'media', title: 'Media Manager' },
  { id: 'articles', title: 'Articles' },
  { id: 'portfolio', title: 'Portfolio' },
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
  const [resetMode, setResetMode] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [updatePasswordMode, setUpdatePasswordMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    // Check for password recovery flow
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get('access_token');
    const type = hashParams.get('type');

    if (type === 'recovery' && accessToken) {
      setUpdatePasswordMode(true);
      setIsAuthenticated(true);
      return;
    }

    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
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
        setIsAuthenticated(true);
        setEmail('');
        setPassword('');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setEmail('');
    setPassword('');
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });

      if (error) throw error;

      setResetSent(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      // Clear the hash from URL
      window.location.hash = '';
      setUpdatePasswordMode(false);
      setNewPassword('');
      setConfirmPassword('');
      alert('Password updated successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  if (updatePasswordMode) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
            </div>
            <h1 className="text-3xl tracking-tight mb-2 text-white">SET NEW PASSWORD</h1>
            <p className="text-sm text-gray-400">Create a new password for your account</p>
          </div>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-400 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-amber-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs tracking-wider uppercase text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-amber-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                placeholder="Confirm new password"
                required
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-3xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-amber-600 text-white rounded-3xl text-xs tracking-wider uppercase hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {loading ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (resetMode) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl mb-4">
                <Lock className="w-8 h-8 text-amber-400" />
              </div>
              <h1 className="text-3xl tracking-tight mb-2 text-white">RESET PASSWORD</h1>
              <p className="text-sm text-gray-400">
                {resetSent ? 'Check your email for reset link' : 'Enter your email to receive reset instructions'}
              </p>
            </div>

            {!resetSent ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div>
                  <label className="block text-xs tracking-wider uppercase text-gray-400 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-amber-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                      placeholder="admin@example.com"
                      autoComplete="email"
                      required
                    />
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
                  className="w-full px-6 py-3 bg-amber-600 text-white rounded-3xl text-xs tracking-wider uppercase hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
                >
                  {loading ? 'SENDING...' : 'SEND RESET LINK'}
                </button>

                <button
                  type="button"
                  onClick={() => { setResetMode(false); setError(''); }}
                  className="w-full px-6 py-3 text-gray-400 text-xs tracking-wider uppercase hover:text-white transition-colors"
                >
                  ← BACK TO LOGIN
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="px-6 py-4 bg-green-500/10 border border-green-500/30 rounded-3xl text-green-400">
                  Password reset link sent to {email}
                </div>
                <button
                  type="button"
                  onClick={() => { setResetMode(false); setResetSent(false); setError(''); }}
                  className="w-full px-6 py-3 text-gray-400 text-xs tracking-wider uppercase hover:text-white transition-colors"
                >
                  ← BACK TO LOGIN
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-3xl mb-4">
              <Lock className="w-8 h-8 text-amber-400" />
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
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-amber-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
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
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-2xl focus:border-amber-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-500 hover:text-white transition-colors"
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
              className="w-full px-6 py-3 bg-amber-600 text-white rounded-3xl text-xs tracking-wider uppercase hover:bg-amber-700 transition-colors disabled:opacity-50 shadow-lg shadow-amber-500/20"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <button
            type="button"
            onClick={() => { setResetMode(true); setError(''); }}
            className="w-full mt-4 text-center text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Forgot password?
          </button>

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
      default:
        return <AdminDashboard onSelectManager={setActiveView} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <SimpleErrorBoundary>
        <AdminLayout 
          activeView={activeView} 
          onNavigate={setActiveView}
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

