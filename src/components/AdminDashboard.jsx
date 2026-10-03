import React, { useState } from 'react';
import { 
  X, Lock, KeyRound, Plus, Trash2, Edit3, Save, RefreshCw, 
  Download, Upload, Check, AlertCircle, Layers, User, Sparkles, 
  PenTool, Cpu, Compass, Tag, Calendar, Globe, Mail, Phone, ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { savePortfolioData, resetToDefaults } from '../utils/storage';

export default function AdminDashboard({ data, onClose, onDataUpdated }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  
  // Navigation tabs: 'projects' | 'categories' | 'skills' | 'timeline' | 'profile' | 'backup'
  const [activeTab, setActiveTab] = useState('projects');
  const [toastMessage, setToastMessage] = useState('');

  // Project editing state
  const [editingProject, setEditingProject] = useState(null);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [projectForm, setProjectForm] = useState({
    id: '',
    title: '',
    category: 'main',
    categoryName: 'Main Project',
    client: '',
    year: '2026',
    coverImage: '',
    gallery: '',
    description: '',
    tags: '',
    colors: '#1e293b, #d97706, #fef3c7'
  });

  // Category / Work Type editing state
  const [editingCategory, setEditingCategory] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: '', name: '' });

  // Profile editing state
  const [profileForm, setProfileForm] = useState({ ...data.profile });

  // Skill inputs
  const [newAnalogSkill, setNewAnalogSkill] = useState('');
  const [newDigitalSkill, setNewDigitalSkill] = useState('');

  // Milestone editing state
  const [editingMilestoneIndex, setEditingMilestoneIndex] = useState(null);
  const [milestoneForm, setMilestoneForm] = useState({ year: '', title: '', org: '' });
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);

  // PIN validation (Default PIN: 2026)
  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pinInput === '2026' || pinInput === 'admin') {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const triggerConfetti = () => {
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}
  };

  // Helper to commit state changes
  const commitUpdate = (updatedData, message) => {
    savePortfolioData(updatedData);
    onDataUpdated(updatedData);
    triggerConfetti();
    if (message) showToast(message);
  };

  // ==========================================
  // 1. WORK TYPES / CATEGORIES CRUD HANDLERS
  // ==========================================
  const handleOpenAddCategory = () => {
    setCategoryForm({ id: '', name: '' });
    setEditingCategory(null);
    setIsAddingCategory(true);
  };

  const handleOpenEditCategory = (cat) => {
    setCategoryForm({ id: cat.id, name: cat.name });
    setEditingCategory(cat);
    setIsAddingCategory(true);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) {
      alert('Please enter a work type name.');
      return;
    }

    const slug = categoryForm.id.trim() 
      ? categoryForm.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_')
      : categoryForm.name.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    let updatedCategories = [...data.categories];
    let updatedProjects = [...data.projects];

    if (editingCategory) {
      // Update existing category
      const oldId = editingCategory.id;
      updatedCategories = updatedCategories.map(c => 
        c.id === oldId ? { ...c, id: slug, name: categoryForm.name.trim() } : c
      );
      // Synchronize affected projects with the new category name and ID
      updatedProjects = updatedProjects.map(p => 
        p.category === oldId 
          ? { ...p, category: slug, categoryName: categoryForm.name.trim() } 
          : p
      );
    } else {
      // Check for duplicate ID
      if (updatedCategories.some(c => c.id === slug)) {
        alert('A work type with this ID already exists. Please choose a different name.');
        return;
      }
      updatedCategories.push({ id: slug, name: categoryForm.name.trim() });
    }

    const updatedData = { ...data, categories: updatedCategories, projects: updatedProjects };
    commitUpdate(updatedData, editingCategory ? 'Work Type Updated!' : 'New Work Type Added!');
    setIsAddingCategory(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = (catId) => {
    if (catId === 'all') {
      alert('Cannot delete the "All Works" filter.');
      return;
    }
    const projectsInCat = data.projects.filter(p => p.category === catId);
    const confirmMsg = projectsInCat.length > 0 
      ? `Are you sure? This category has ${projectsInCat.length} project(s). They will be reassigned to the first available category.`
      : 'Are you sure you want to delete this work type?';

    if (window.confirm(confirmMsg)) {
      const remainingCategories = data.categories.filter(c => c.id !== catId);
      const fallbackCat = remainingCategories.find(c => c.id !== 'all') || { id: 'main', name: 'General' };

      // Reassign affected projects to fallback category
      const updatedProjects = data.projects.map(p => 
        p.category === catId ? { ...p, category: fallbackCat.id, categoryName: fallbackCat.name } : p
      );

      const updatedData = { ...data, categories: remainingCategories, projects: updatedProjects };
      commitUpdate(updatedData, 'Work Type Deleted & Projects Reassigned.');
    }
  };

  // ==========================================
  // 2. WORKS / PROJECTS CRUD HANDLERS
  // ==========================================
  const validCategoryList = data.categories.filter(c => c.id !== 'all');

  const handleOpenAddProject = () => {
    const defaultCat = validCategoryList[0] || { id: 'main', name: 'Main Project' };
    setProjectForm({
      id: 'proj-' + Date.now(),
      title: '',
      category: defaultCat.id,
      categoryName: defaultCat.name,
      client: '',
      year: new Date().getFullYear().toString(),
      coverImage: 'https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&q=80&w=1000',
      gallery: '',
      description: '',
      tags: 'Brand Identity, Packaging',
      colors: '#1e293b, #d97706, #fef3c7'
    });
    setEditingProject(null);
    setIsAddingProject(true);
  };

  const handleOpenEditProject = (proj) => {
    setProjectForm({
      ...proj,
      gallery: (proj.gallery || []).join('\n'),
      tags: (proj.tags || []).join(', '),
      colors: (proj.colors || []).join(', ')
    });
    setEditingProject(proj);
    setIsAddingProject(true);
  };

  const handleSaveProject = (e) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.coverImage) {
      alert('Please provide at least a Project Title and Cover Image URL.');
      return;
    }

    const matchedCategory = data.categories.find(c => c.id === projectForm.category) || { name: 'Main Project' };

    const galleryArr = projectForm.gallery
      ? projectForm.gallery.split('\n').map(s => s.trim()).filter(Boolean)
      : [projectForm.coverImage];

    const tagsArr = projectForm.tags
      ? projectForm.tags.split(',').map(s => s.trim()).filter(Boolean)
      : ['Design'];

    const colorsArr = projectForm.colors
      ? projectForm.colors.split(',').map(s => s.trim()).filter(Boolean)
      : ['#090b0e', '#f59e0b'];

    const newProjectItem = {
      ...projectForm,
      categoryName: matchedCategory.name,
      gallery: galleryArr,
      tags: tagsArr,
      colors: colorsArr
    };

    let updatedProjects = [...data.projects];
    if (editingProject) {
      updatedProjects = updatedProjects.map(p => p.id === editingProject.id ? newProjectItem : p);
    } else {
      updatedProjects.unshift(newProjectItem);
    }

    const updatedData = { ...data, projects: updatedProjects };
    commitUpdate(updatedData, editingProject ? 'Project Updated Successfully!' : 'New Project Published to Live Site!');
    setIsAddingProject(false);
    setEditingProject(null);
  };

  const handleDeleteProject = (projId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = data.projects.filter(p => p.id !== projId);
      const updatedData = { ...data, projects: updatedProjects };
      commitUpdate(updatedData, 'Project Deleted.');
    }
  };

  // ==========================================
  // 3. SKILLS / TOOLKITS CRUD HANDLERS
  // ==========================================
  const handleAddAnalogSkill = (e) => {
    e.preventDefault();
    if (!newAnalogSkill.trim()) return;
    const current = profileForm.skills?.analog || [];
    if (current.includes(newAnalogSkill.trim())) return;
    const updated = {
      ...profileForm,
      skills: {
        ...profileForm.skills,
        analog: [...current, newAnalogSkill.trim()]
      }
    };
    setProfileForm(updated);
    commitUpdate({ ...data, profile: updated }, 'Analog Skill Added!');
    setNewAnalogSkill('');
  };

  const handleDeleteAnalogSkill = (skillToRemove) => {
    const updated = {
      ...profileForm,
      skills: {
        ...profileForm.skills,
        analog: profileForm.skills.analog.filter(s => s !== skillToRemove)
      }
    };
    setProfileForm(updated);
    commitUpdate({ ...data, profile: updated }, 'Skill Removed.');
  };

  const handleAddDigitalSkill = (e) => {
    e.preventDefault();
    if (!newDigitalSkill.trim()) return;
    const current = profileForm.skills?.digital || [];
    if (current.includes(newDigitalSkill.trim())) return;
    const updated = {
      ...profileForm,
      skills: {
        ...profileForm.skills,
        digital: [...current, newDigitalSkill.trim()]
      }
    };
    setProfileForm(updated);
    commitUpdate({ ...data, profile: updated }, 'Digital Tool Added!');
    setNewDigitalSkill('');
  };

  const handleDeleteDigitalSkill = (toolToRemove) => {
    const updated = {
      ...profileForm,
      skills: {
        ...profileForm.skills,
        digital: profileForm.skills.digital.filter(s => s !== toolToRemove)
      }
    };
    setProfileForm(updated);
    commitUpdate({ ...data, profile: updated }, 'Tool Removed.');
  };

  // ==========================================
  // 4. CAREER MILESTONES TIMELINE CRUD
  // ==========================================
  const handleOpenAddMilestone = () => {
    setMilestoneForm({ year: new Date().getFullYear().toString(), title: '', org: '' });
    setEditingMilestoneIndex(null);
    setIsAddingMilestone(true);
  };

  const handleOpenEditMilestone = (item, index) => {
    setMilestoneForm({ ...item });
    setEditingMilestoneIndex(index);
    setIsAddingMilestone(true);
  };

  const handleSaveMilestone = (e) => {
    e.preventDefault();
    if (!milestoneForm.year || !milestoneForm.title) {
      alert('Please enter Year and Title for the milestone.');
      return;
    }

    const currentTimeline = [...(profileForm.experienceTimeline || [])];
    if (editingMilestoneIndex !== null) {
      currentTimeline[editingMilestoneIndex] = { ...milestoneForm };
    } else {
      currentTimeline.unshift({ ...milestoneForm });
    }

    const updatedProfile = { ...profileForm, experienceTimeline: currentTimeline };
    setProfileForm(updatedProfile);
    commitUpdate({ ...data, profile: updatedProfile }, 'Milestone Saved!');
    setIsAddingMilestone(false);
    setEditingMilestoneIndex(null);
  };

  const handleDeleteMilestone = (index) => {
    if (window.confirm('Delete this milestone?')) {
      const currentTimeline = profileForm.experienceTimeline.filter((_, i) => i !== index);
      const updatedProfile = { ...profileForm, experienceTimeline: currentTimeline };
      setProfileForm(updatedProfile);
      commitUpdate({ ...data, profile: updatedProfile }, 'Milestone Deleted.');
    }
  };

  // ==========================================
  // 5. PROFILE & ABOUT ME HANDLERS
  // ==========================================
  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updatedData = { ...data, profile: profileForm };
    commitUpdate(updatedData, 'Designer Profile & Bio Updated!');
  };

  // ==========================================
  // 6. BACKUP & RESTORE HANDLERS
  // ==========================================
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `yashraj_portfolio_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('JSON Backup Downloaded!');
  };

  const handleImportJson = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.projects && imported.profile && imported.categories) {
          commitUpdate(imported, 'Data Successfully Restored from Backup!');
          setProfileForm(imported.profile);
        } else {
          alert('Invalid backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetFactory = () => {
    if (window.confirm('Reset all projects, work types, and profile back to the initial showcase state?')) {
      const resetData = resetToDefaults();
      onDataUpdated(resetData);
      setProfileForm(resetData.profile);
      showToast('Reset to Factory Defaults.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-fadeIn">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-5 py-3 rounded-xl bg-amber-500 text-black font-bold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-3xl glass-panel border border-[var(--border-color)] bg-[var(--modal-bg)] text-[var(--text-body)] overflow-hidden shadow-2xl">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-[var(--text-heading)] text-base">Studio CMS &middot; Complete Studio Manager</h2>
              <p className="text-[11px] font-mono text-[var(--text-subtle)]">Non-Tech Visual Admin Panel &middot; Full Customization</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-subtle)] hover:text-[var(--text-heading)] transition-all"
            title="Exit Studio CMS"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Gate (PIN Protection) */}
        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <form onSubmit={handlePinSubmit} className="max-w-sm w-full space-y-5 text-center glass-panel p-8 rounded-2xl border border-[var(--border-color)]">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Enter Studio PIN</h3>
                <p className="text-xs text-[var(--text-subtle)]">Default PIN is <code className="text-amber-500 font-mono font-bold">2026</code></p>
              </div>

              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="Enter PIN (2026)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className={`w-full text-center text-xl tracking-widest py-3 rounded-xl bg-[var(--pill-bg)] border ${
                  pinError ? 'border-rose-500' : 'border-[var(--border-color)] focus:border-amber-500/50'
                } text-[var(--text-heading)] focus:outline-none`}
              />

              {pinError && (
                <p className="text-xs text-rose-500 font-mono">Incorrect PIN. Try 2026.</p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                Access Dashboard &rarr;
              </button>
            </form>
          </div>
        ) : (
          /* Authenticated Dashboard */
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-[var(--border-color)] p-4 space-y-2 bg-[var(--bg-subtle)] flex-shrink-0">
              {[
                { id: 'projects', name: 'Works & Projects', icon: Layers, count: data.projects.length },
                { id: 'categories', name: 'Work Types / Categories', icon: Tag, count: validCategoryList.length },
                { id: 'skills', name: 'Skills & Toolkits', icon: PenTool },
                { id: 'timeline', name: 'Career Milestones', icon: Compass, count: profileForm.experienceTimeline?.length || 0 },
                { id: 'profile', name: 'Profile & About', icon: User },
                { id: 'backup', name: 'Backup & Restore', icon: RefreshCw },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => { 
                      setActiveTab(tab.id); 
                      setIsAddingProject(false); 
                      setIsAddingCategory(false);
                      setIsAddingMilestone(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                        : 'text-[var(--text-subtle)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[var(--text-heading)]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.name}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                        isActive ? 'bg-black/30 text-black' : 'bg-[var(--pill-bg)] text-[var(--text-subtle)]'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto">
              
              {/* ========================================================= */}
              {/* TAB 1: WORKS & PROJECTS */}
              {/* ========================================================= */}
              {activeTab === 'projects' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                    <div>
                      <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Manage Works &amp; Portfolio</h3>
                      <p className="text-xs text-[var(--text-subtle)]">Add, edit, or delete items across all active work types.</p>
                    </div>

                    {!isAddingProject && (
                      <button
                        onClick={handleOpenAddProject}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Work</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Form Modal inside */}
                  {isAddingProject ? (
                    <form onSubmit={handleSaveProject} className="space-y-4 glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                        <h4 className="font-display font-bold text-[var(--text-heading)] text-base">
                          {editingProject ? 'Edit Project: ' + editingProject.title : 'Publish New Project'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="text-xs font-mono text-[var(--text-subtle)] hover:text-[var(--text-heading)]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Project Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Royal Botanical Packaging"
                            value={projectForm.title}
                            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                          />
                        </div>

                        {/* DYNAMIC CATEGORY DROPDOWN */}
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Work Type / Category *</label>
                          <select
                            value={projectForm.category}
                            onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                          >
                            {validCategoryList.map((cat) => (
                              <option key={cat.id} value={cat.id}>
                                {cat.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Client / Commission</label>
                          <input
                            type="text"
                            placeholder="e.g. Heritage Trust"
                            value={projectForm.client}
                            onChange={(e) => setProjectForm({ ...projectForm, client: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Year</label>
                          <input
                            type="text"
                            placeholder="2026"
                            value={projectForm.year}
                            onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-[var(--text-subtle)]">Main Cover Image URL *</label>
                        <input
                          type="url"
                          required
                          placeholder="https://..."
                          value={projectForm.coverImage}
                          onChange={(e) => setProjectForm({ ...projectForm, coverImage: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-[var(--text-subtle)]">Additional Gallery Image URLs (1 per line)</label>
                        <textarea
                          rows={3}
                          placeholder="https://image1.jpg&#10;https://image2.jpg"
                          value={projectForm.gallery}
                          onChange={(e) => setProjectForm({ ...projectForm, gallery: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-[var(--text-subtle)]">Project Narrative &amp; Approach</label>
                        <textarea
                          rows={3}
                          placeholder="Describe the creative approach, materials, printing techniques..."
                          value={projectForm.description}
                          onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Tags (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="Packaging, Gold Foil, Minimalist"
                            value={projectForm.tags}
                            onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Palette Hex Codes (comma-separated)</label>
                          <input
                            type="text"
                            placeholder="#1e293b, #d97706, #fef3c7"
                            value={projectForm.colors}
                            onChange={(e) => setProjectForm({ ...projectForm, colors: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingProject(false)}
                          className="px-4 py-2 rounded-xl bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/10 text-xs text-[var(--text-subtle)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save &amp; Publish Work</span>
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Existing Projects List */
                    <div className="space-y-3">
                      {data.projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-xl glass-panel border border-[var(--border-color)] flex items-center justify-between gap-4 hover:border-amber-500/30 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-10 rounded-lg overflow-hidden bg-black/20 dark:bg-black/40 flex-shrink-0">
                              <img src={proj.coverImage} alt={proj.title} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold text-[var(--text-heading)]">{proj.title}</h4>
                              <div className="flex items-center gap-2 text-xs font-mono text-[var(--text-subtle)]">
                                <span className="text-amber-500 font-semibold">{proj.categoryName || proj.category}</span>
                                <span>&middot;</span>
                                <span>{proj.client}</span>
                                <span>&middot;</span>
                                <span>{proj.year}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenEditProject(proj)}
                              className="p-2 rounded-lg bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-subtle)] hover:text-[var(--text-heading)]"
                              title="Edit Project"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500"
                              title="Delete Project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 2: WORK TYPES / CATEGORIES (FULL CRUD) */}
              {/* ========================================================= */}
              {activeTab === 'categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                    <div>
                      <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Manage Work Types / Categories</h3>
                      <p className="text-xs text-[var(--text-subtle)]">
                        Add new disciplines (e.g. Motion Graphics, 3D Render, UI/UX), rename, or delete existing categories.
                      </p>
                    </div>

                    {!isAddingCategory && (
                      <button
                        onClick={handleOpenAddCategory}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add New Work Type</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Category Form */}
                  {isAddingCategory && (
                    <form onSubmit={handleSaveCategory} className="space-y-4 glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                        <h4 className="font-display font-bold text-[var(--text-heading)] text-base">
                          {editingCategory ? 'Edit Work Type: ' + editingCategory.name : 'Create New Work Type'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="text-xs font-mono text-[var(--text-subtle)] hover:text-[var(--text-heading)]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Work Type Display Name *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Motion Graphics &amp; 3D"
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Slug / Unique ID (optional)</label>
                          <input
                            type="text"
                            placeholder="auto-generated from name"
                            value={categoryForm.id}
                            onChange={(e) => setCategoryForm({ ...categoryForm, id: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                          />
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(false)}
                          className="px-4 py-2 rounded-xl bg-[var(--pill-bg)] text-xs text-[var(--text-subtle)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Work Type</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Categories List */}
                  <div className="space-y-3">
                    {data.categories.map((cat) => {
                      const isDefaultAll = cat.id === 'all';
                      const count = isDefaultAll 
                        ? data.projects.length 
                        : data.projects.filter(p => p.category === cat.id).length;

                      return (
                        <div
                          key={cat.id}
                          className="p-4 rounded-xl glass-panel border border-[var(--border-color)] flex items-center justify-between gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 font-mono font-bold text-xs">
                              #
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-[var(--text-heading)] flex items-center gap-2">
                                <span>{cat.name}</span>
                                {isDefaultAll && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[var(--pill-bg)] text-[var(--text-subtle)]">
                                    System Root
                                  </span>
                                )}
                              </div>
                              <div className="text-xs font-mono text-[var(--text-subtle)]">
                                ID: <code className="text-amber-500">{cat.id}</code> &middot; {count} Projects Associated
                              </div>
                            </div>
                          </div>

                          {!isDefaultAll && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditCategory(cat)}
                                className="p-2 rounded-lg bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-subtle)] hover:text-[var(--text-heading)]"
                                title="Edit Work Type"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500"
                                title="Delete Work Type"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 3: SKILLS & TOOLKITS (FULL CRUD) */}
              {/* ========================================================= */}
              {activeTab === 'skills' && (
                <div className="space-y-8">
                  <div className="pb-4 border-b border-[var(--border-color)]">
                    <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Manage Skills &amp; Creative Toolkits</h3>
                    <p className="text-xs text-[var(--text-subtle)]">Add or remove analog disciplines and digital software standards.</p>
                  </div>

                  {/* Analog Skills Section */}
                  <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-amber-500 text-xs font-mono font-bold uppercase tracking-wider">
                        <PenTool className="w-4 h-4" />
                        <span>Analog &amp; Tactile Mastery Skills</span>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-subtle)]">
                        {profileForm.skills?.analog?.length || 0} Skills Active
                      </span>
                    </div>

                    {/* Skill Badges List with Delete Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(profileForm.skills?.analog || []).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-heading)] shadow-sm"
                        >
                          <span>{skill}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAnalogSkill(skill)}
                            className="text-[var(--text-subtle)] hover:text-rose-500 transition-colors"
                            title="Remove Skill"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Analog Skill Form */}
                    <form onSubmit={handleAddAnalogSkill} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add new analog craft (e.g. Copperplate Calligraphy, Gold Leafing)..."
                        value={newAnalogSkill}
                        onChange={(e) => setNewAnalogSkill(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                      >
                        Add Skill
                      </button>
                    </form>
                  </div>

                  {/* Digital Software Section */}
                  <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sky-500 text-xs font-mono font-bold uppercase tracking-wider">
                        <Cpu className="w-4 h-4" />
                        <span>Digital Software Standards</span>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-subtle)]">
                        {profileForm.skills?.digital?.length || 0} Software Tools Active
                      </span>
                    </div>

                    {/* Digital Tool Badges with Delete Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {(profileForm.skills?.digital || []).map((tool, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs font-mono text-[var(--text-heading)] shadow-sm"
                        >
                          <span>{tool}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteDigitalSkill(tool)}
                            className="text-[var(--text-subtle)] hover:text-rose-500 transition-colors"
                            title="Remove Tool"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add Digital Tool Form */}
                    <form onSubmit={handleAddDigitalSkill} className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add new software (e.g. Cinema 4D, Glyphs 3, Midjourney)..."
                        value={newDigitalSkill}
                        onChange={(e) => setNewDigitalSkill(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs"
                      >
                        Add Software
                      </button>
                    </form>
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 4: CAREER MILESTONES (FULL CRUD) */}
              {/* ========================================================= */}
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
                    <div>
                      <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Manage Career Milestones &amp; History</h3>
                      <p className="text-xs text-[var(--text-subtle)]">Add, edit, or delete experience timeline entries shown in the About section.</p>
                    </div>

                    {!isAddingMilestone && (
                      <button
                        onClick={handleOpenAddMilestone}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-md active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Milestone</span>
                      </button>
                    )}
                  </div>

                  {/* Add / Edit Milestone Form */}
                  {isAddingMilestone && (
                    <form onSubmit={handleSaveMilestone} className="space-y-4 glass-panel p-6 rounded-2xl border border-[var(--border-color)]">
                      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                        <h4 className="font-display font-bold text-[var(--text-heading)] text-base">
                          {editingMilestoneIndex !== null ? 'Edit Milestone' : 'Add Career Milestone'}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingMilestone(false)}
                          className="text-xs font-mono text-[var(--text-subtle)] hover:text-[var(--text-heading)]"
                        >
                          Cancel
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Year / Duration *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2025–Present"
                            value={milestoneForm.year}
                            onChange={(e) => setMilestoneForm({ ...milestoneForm, year: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-mono text-[var(--text-subtle)]">Role / Achievement Title *</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Lead Brand &amp; Packaging Designer"
                            value={milestoneForm.title}
                            onChange={(e) => setMilestoneForm({ ...milestoneForm, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-[var(--text-subtle)]">Organization / Studio / Description</label>
                        <input
                          type="text"
                          placeholder="e.g. Yashraj Studio · Global Clients"
                          value={milestoneForm.org}
                          onChange={(e) => setMilestoneForm({ ...milestoneForm, org: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                        />
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingMilestone(false)}
                          className="px-4 py-2 rounded-xl bg-[var(--pill-bg)] text-xs text-[var(--text-subtle)]"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex items-center gap-1.5 px-6 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Milestone</span>
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Milestones List */}
                  <div className="space-y-3">
                    {(profileForm.experienceTimeline || []).map((item, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl glass-panel border border-[var(--border-color)] flex items-center justify-between gap-4"
                      >
                        <div className="flex items-start gap-4">
                          <span className="text-xs font-mono font-bold text-amber-500 w-24 flex-shrink-0 pt-0.5">
                            {item.year}
                          </span>
                          <div>
                            <div className="text-sm font-semibold text-[var(--text-heading)]">{item.title}</div>
                            <div className="text-xs text-[var(--text-subtle)]">{item.org}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEditMilestone(item, idx)}
                            className="p-2 rounded-lg bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/15 text-[var(--text-subtle)] hover:text-[var(--text-heading)]"
                            title="Edit Milestone"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(idx)}
                            className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500"
                            title="Delete Milestone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>
              )}

              {/* ========================================================= */}
              {/* TAB 5: PROFILE & ABOUT ME */}
              {/* ========================================================= */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="pb-4 border-b border-[var(--border-color)]">
                    <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Designer Profile &amp; Bio Information</h3>
                    <p className="text-xs text-[var(--text-subtle)]">Update personal narrative, designation, photo, and social channels.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Full Name</label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Designation (Strictly Graphic Designer)</label>
                      <input
                        type="text"
                        value={profileForm.designation}
                        onChange={(e) => setProfileForm({ ...profileForm, designation: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Location</label>
                      <input
                        type="text"
                        value={profileForm.location}
                        onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Avatar / Portrait Photo URL</label>
                      <input
                        type="url"
                        value={profileForm.avatar}
                        onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[var(--text-subtle)]">Hero Subheadline Statement</label>
                    <textarea
                      rows={2}
                      value={profileForm.heroSubheadline}
                      onChange={(e) => setProfileForm({ ...profileForm, heroSubheadline: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono text-[var(--text-subtle)]">About Narrative &amp; Manifesto</label>
                    <textarea
                      rows={4}
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] resize-none"
                    />
                  </div>

                  {/* Contact Channels Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[var(--border-color)]">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Studio Email</label>
                      <input
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Contact Phone</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">Instagram Profile URL</label>
                      <input
                        type="url"
                        value={profileForm.instagram || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-[var(--text-subtle)]">LinkedIn Profile URL</label>
                      <input
                        type="url"
                        value={profileForm.linkedin || ''}
                        onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--pill-bg)] border border-[var(--border-color)] text-xs text-[var(--text-heading)] font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shadow-md active:scale-95"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Profile Information</span>
                    </button>
                  </div>
                </form>
              )}

              {/* ========================================================= */}
              {/* TAB 6: BACKUP & RESTORE */}
              {/* ========================================================= */}
              {activeTab === 'backup' && (
                <div className="space-y-6">
                  <div className="pb-4 border-b border-[var(--border-color)]">
                    <h3 className="font-display font-bold text-lg text-[var(--text-heading)]">Data Portability &amp; Backups</h3>
                    <p className="text-xs text-[var(--text-subtle)]">
                      Download all your projects, dynamic work types, skills, and milestones as a single JSON file or restore from a backup.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Export */}
                    <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center">
                        <Download className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-[var(--text-heading)] text-sm">Export Complete Backup</h4>
                        <p className="text-xs text-[var(--text-subtle)]">Save a copy of all current works, categories, skills, and bios to your device.</p>
                      </div>
                      <button
                        onClick={handleExportJson}
                        className="w-full py-2.5 rounded-xl bg-[var(--pill-bg)] hover:bg-amber-500 hover:text-black text-[var(--text-heading)] font-semibold text-xs transition-all border border-[var(--border-color)]"
                      >
                        Download JSON Backup
                      </button>
                    </div>

                    {/* Import */}
                    <div className="glass-panel p-6 rounded-2xl border border-[var(--border-color)] space-y-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-500 flex items-center justify-center">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-semibold text-[var(--text-heading)] text-sm">Restore from Backup</h4>
                        <p className="text-xs text-[var(--text-subtle)]">Upload a previously saved portfolio JSON file to instantly restore.</p>
                      </div>
                      <label className="w-full py-2.5 rounded-xl bg-[var(--pill-bg)] hover:bg-black/10 dark:hover:bg-white/20 text-[var(--text-heading)] font-semibold text-xs transition-all text-center block cursor-pointer border border-[var(--border-color)]">
                        <span>Select JSON File</span>
                        <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {/* Reset */}
                  <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-rose-500">Factory Reset</div>
                      <div className="text-[11px] text-[var(--text-subtle)]">Restore the initial curated showcase data</div>
                    </div>
                    <button
                      onClick={handleResetFactory}
                      className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 text-xs font-semibold"
                    >
                      Reset to Defaults
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
