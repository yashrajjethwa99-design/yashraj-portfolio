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
import CeedLabSection from './components/CeedLab/CeedLabSection';
import { getPortfolioData } from './utils/storage';

export default function App() {
  const [data, setData] = useState(() => getPortfolioData());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getPortfolioData());
    };
    window.addEventListener('portfolio_data_updated', handleUpdate);
    return () => window.removeEventListener('portfolio_data_updated', handleUpdate);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-body)] transition-colors duration-300 relative selection:bg-amber-500 selection:text-black">
      
      {/* Smooth Ambient Spotlight Follower */}
      <SpotlightCursor />

      {/* Top Fixed Navigation with Theme Toggle */}
      <Navbar 
        onOpenAdmin={() => setIsAdminOpen(true)} 
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

        {/* 3. CEED Spatial & AI Design Innovation Lab */}
        <CeedLabSection />

        {/* 4. Art-Directed About Section */}
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
