import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { LogOut, ExternalLink, Menu } from 'lucide-react';
import { TimeTrackerWidget } from './finance/TimeTrackerWidget';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeView: string;
  onNavigate: (view: string) => void;
  onSiteNavigation: (page: string) => void;
  onLogout: () => void;
  pageTitle: string;
}

export function AdminLayout({ children, activeView, onNavigate, onSiteNavigation, onLogout, pageTitle }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      if (desktop) {
        setMobileMenuOpen(false);
      }
    };
    
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && !isDesktop && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div 
            className="fixed inset-y-0 left-0 z-50"
            style={{ width: '288px', backgroundColor: '#18181b' }}
          >
            <Sidebar
              activeView={activeView}
              onNavigate={(view) => {
                onNavigate(view);
                setMobileMenuOpen(false);
              }}
              mobileOpen={true}
              onClose={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      )}

      {/* Main Layout - CSS Grid */}
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: isDesktop ? '288px 1fr' : '1fr',
          width: '100%',
          height: '100vh',
          backgroundColor: '#09090b',
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Desktop Sidebar */}
        {isDesktop && (
          <div 
            style={{ 
              width: '288px',
              height: '100vh',
              overflowY: 'auto',
              overflowX: 'hidden',
              backgroundColor: '#18181b',
              borderRight: '1px solid #27272a',
              zIndex: 10,
              flexShrink: 0
            }}
          >
            <Sidebar
              activeView={activeView}
              onNavigate={onNavigate}
              mobileOpen={false}
              onClose={() => {}}
            />
          </div>
        )}

        {/* Main Content */}
        <div 
          style={{ 
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            width: '100%'
          }}
        >
          {/* Header */}
          <header 
            style={{ 
              height: '64px',
              backgroundColor: '#18181b',
              borderBottom: '1px solid #27272a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 1rem',
              position: 'sticky',
              top: 0,
              zIndex: 20,
              flexShrink: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {/* Hamburger - Only on mobile */}
              {!isDesktop && (
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  style={{
                    padding: '0.5rem',
                    color: '#a1a1aa',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'white';
                    e.currentTarget.style.backgroundColor = '#27272a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = '#a1a1aa';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Open menu"
                >
                  <Menu className="w-5 h-5" />
                </button>
              )}
              <h1 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', margin: 0 }}>
                {pageTitle}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={() => onSiteNavigation('home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#d4d4d8',
                  backgroundColor: '#27272a',
                  border: '1px solid #3f3f46',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.backgroundColor = '#3f3f46';
                  e.currentTarget.style.borderColor = '#52525b';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#d4d4d8';
                  e.currentTarget.style.backgroundColor = '#27272a';
                  e.currentTarget.style.borderColor = '#3f3f46';
                }}
                aria-label="View site"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="hidden sm:inline">View Site</span>
              </button>
              <button
                onClick={onLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  color: '#f87171',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '0.5rem',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                }}
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          {/* Scrollable Content */}
          <main 
            style={{ 
              flex: 1,
              overflowY: 'auto',
              minHeight: 0
            }}
          >
            <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto', width: '100%' }}>
              {children}
            </div>
          </main>
        </div>
      </div>

      <TimeTrackerWidget />
    </>
  );
}
