import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import WorkSection from './components/WorkSection';
import AboutSection from './components/AboutSection';
import ContactSection from './components/ContactSection';
import ProjectModal from './components/ProjectModal';
import AdminDashboard from './components/AdminDashboard';
import SpotlightCursor from './components/SpotlightCursor';
import MarqueeBanner from './components/MarqueeBanner';
import CeedLabPage from './components/CeedLab/CeedLabPage';
import { getPortfolioData } from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => getPortfolioData());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  // Dedicated Route State: 'home' (Index Portfolio) vs 'ceed-lab' (Standalone Studio Page)
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#ceed-lab' || hash === '#/ceed-lab' || path === '/ceed-lab') {
        return 'ceed-lab';
      }
    }
    return 'home';
  });

  // Listen to browser hash and back/forward navigation
  useEffect(() => {
    const handleNavigation = () => {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (hash === '#ceed-lab' || hash === '#/ceed-lab' || path === '/ceed-lab') {
        setCurrentPage('ceed-lab');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    return () => {
      window.removeEventListener('hashchange', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, []);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData());
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  const navigateToHome = () => {
    setCurrentPage('home');
    window.location.hash = '';
    if (window.location.pathname === '/ceed-lab') {
      window.history.pushState(null, '', '/');
    }
  };

  const navigateToCeedLab = () => {
    setCurrentPage('ceed-lab');
    window.location.hash = '#ceed-lab';
  };

  // IF ON DEDICATED CEED LAB PAGE:
  if (currentPage === 'ceed-lab') {
    return (
      <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-body)] transition-colors duration-300 relative selection:bg-amber-500 selection:text-black">
        <SpotlightCursor />
        <CeedLabPage onBackToHome={navigateToHome} />
      </div>
    );
  }

  // IF ON MAIN INDEX PORTFOLIO (Clean, 100% Graphic Designer Focus):
  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-body)] transition-colors duration-300 relative selection:bg-amber-500 selection:text-black">
      
      {/* Smooth Ambient Spotlight Follower */}
      <SpotlightCursor />

      {/* Top Fixed Navigation with CEED Lab link & Theme Toggle */}
      <Navbar 
        onOpenAdmin={() => setIsAdminOpen(true)} 
        onOpenCeedLab={navigateToCeedLab}
      />

      {/* Main Sections */}
      <main>
        {/* 1. Hero Section with 3D Centerpiece & Floating Banner Badges */}
        <HeroSection 
          profile={data.profile} 
        />

        {/* 2. Showstopper Dynamic Categories Works Gallery */}
        <WorkSection 
          projects={data.projects} 
          categories={data.categories} 
          onSelectProject={(proj) => setSelectedProject(proj)} 
        />

        {/* 3. Art-Directed About Section */}
        <AboutSection 
          profile={data.profile} 
        />

        {/* Reverse Kinetic Marquee Divider before Contact */}
        <div className="py-6 bg-[var(--bg-main)]">
          <MarqueeBanner 
            reverse={true} 
            items={[
              "LET'S BUILD SOMETHING ICONIC",
              'OPEN FOR COMMISSIONS',
              'BRAND IDENTITY & PACKAGING',
              'CALLIGRAPHY & LETTERING',
              'WORLDWIDE COLLABORATION',
              'YASHRAJ STUDIO'
            ]}
          />
        </div>

        {/* 4. Contact Section & Global Footer */}
        <ContactSection 
          profile={data.profile} 
          onOpenAdmin={() => setIsAdminOpen(true)} 
        />
      </main>

      {/* Project Case Study Fullscreen Modal */}
      {selectedProject && (
        <ProjectModal 
          project={selectedProject} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {/* Studio CMS Admin Dashboard Modal */}
      {isAdminOpen && (
        <AdminDashboard 
          data={data} 
          onClose={() => setIsAdminOpen(false)} 
          onDataUpdated={(updated) => setData(updated)} 
        />
      )}

    </div>
  );
}
