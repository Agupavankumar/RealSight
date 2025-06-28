import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  TrendingUp, 
  Users, 
  MousePointer, 
  FileText, 
  Plus,
  ChevronDown
} from 'lucide-react';
import { apiService, AnalyticsData, ProjectSummary } from '../services/apiService';
import './Dashboard.css';
import ManageAds from './manage/ManageAds';
import { SurveysAnalyticsTab } from './monitor/SurveysAnalyticsTab';
import { Modal } from './Modal';
import ManageSurveys from './manage/ManageSurveys';
import { OverviewTab } from './monitor/OverviewTab';
import { AdsAnalyticsTab } from './monitor/AdsAnalyticsTab';

interface DashboardProps {
  projectId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ projectId = 'project-001' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ads' | 'surveys' | 'manage-ads' | 'manage-surveys'>('overview'); // Auto-select overview tab on load
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentProjectId, setCurrentProjectId] = useState(projectId);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);
  const projectsLoaded = useRef(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
  const [newProjectForm, setNewProjectForm] = useState({
    name: '',
    description: ''
  });
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  useEffect(() => {
    if (!projectsLoaded.current) {
      loadProjects();
    }
  }, []);

  useEffect(() => {
    if (currentProjectId) {
      loadAnalytics();
    }
  }, [currentProjectId, dateRange]);

  // Close dropdown functionality
  const closeProjectDropdown = useCallback(() => {
    setIsProjectDropdownOpen(false);
  }, []);

  // Close dropdown when clicking outside or pressing escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        closeProjectDropdown();
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeProjectDropdown();
      }
    };

    if (isProjectDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isProjectDropdownOpen, closeProjectDropdown]);

  const loadProjects = async () => {
    if (projectsLoaded.current) return; // Prevent duplicate calls
    
    try {
      setProjectsLoading(true);
      setProjectsError(null);
      projectsLoaded.current = true; // Mark as loading started
      
      const projectsData = await apiService.getAllProjects();
      setProjects(projectsData);
      
      // Always set the first available active project as current
      if (projectsData.length > 0) {
        const firstActiveProject = projectsData.find(p => p.isActive) || projectsData[0];
        setCurrentProjectId(firstActiveProject.id);
      }
    } catch (err) {
      setProjectsError('Failed to load projects');
      console.error('Projects error:', err);
      projectsLoaded.current = false; // Reset on error so retry can work
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAnalytics(currentProjectId, dateRange.from, dateRange.to);
      setAnalyticsData(data);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (days: number) => {
    setDateRange({
      from: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
      to: new Date(),
    });
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleTabChange = (tab: 'overview' | 'ads' | 'surveys' | 'manage-ads' | 'manage-surveys') => {
    setSelectedTab(tab);
    setIsMenuOpen(false); // Close menu after selection
  };

  if (projectsLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  if (projectsError) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{projectsError}</p>
          <button onClick={loadProjects} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadAnalytics} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    );
  }



  const handleManageAdsClick = () => {
    setSelectedTab('manage-ads');
  };

  const handleCreateProject = () => {
    setIsCreateProjectModalOpen(true);
  };

  const handleCloseCreateProjectModal = () => {
    setIsCreateProjectModalOpen(false);
    setNewProjectForm({ name: '', description: '' });
  };

  const handleFormChange = (field: 'name' | 'description', value: string) => {
    setNewProjectForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitProject = async () => {
    if (!newProjectForm.name.trim()) {
      alert('Project name is required');
      return;
    }

    try {
      setIsCreatingProject(true);
      
      // Call the POST API to create the project
      const newProject = await apiService.createProject({
        name: newProjectForm.name.trim(),
        description: newProjectForm.description.trim()
      });
      
      console.log('Project created successfully:', newProject);
      
      // Close the modal and reset form
      setIsCreateProjectModalOpen(false);
      setNewProjectForm({ name: '', description: '' });
      
      // Reload projects to show the new one
      projectsLoaded.current = false; // Reset the ref so loadProjects can run again
      await loadProjects();
      
      // Select the newly created project
      setCurrentProjectId(newProject.id);
      
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    setCurrentProjectId(projectId);
    setIsProjectDropdownOpen(false);
  };

  const toggleProjectDropdown = () => {
    setIsProjectDropdownOpen(!isProjectDropdownOpen);
  };



  const getCurrentProjectName = () => {
    const currentProject = projects.find(p => p.id === currentProjectId);
    return currentProject?.name || 'Unknown Project';
  };

  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>DynaQ Analytics</h2>
          <button 
            className="create-project-btn"
            onClick={handleCreateProject}
            title="Create a new project"
          >
            <Plus size={16} />
            <span>Create a new Project</span>
          </button>
        </div>
        
        <div className="sidebar-section">
          <div className="section-title">Monitor</div>
          <button 
            onClick={() => handleTabChange('overview')}
            className={`sidebar-item ${selectedTab === 'overview' ? 'active' : ''}`}
          >
            <TrendingUp size={18} />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => handleTabChange('ads')}
            className={`sidebar-item ${selectedTab === 'ads' ? 'active' : ''}`}
          >
            <MousePointer size={18} />
            <span>Ads Analytics</span>
          </button>
          <button 
            onClick={() => handleTabChange('surveys')}
            className={`sidebar-item ${selectedTab === 'surveys' ? 'active' : ''}`}
          >
            <FileText size={18} />
            <span>Surveys Analytics</span>
          </button>
        </div>

        <div className="sidebar-section">
          <div className="section-title">MANAGE</div>
          <button className={`sidebar-item ${selectedTab === 'manage-ads' ? 'active' : ''}`} onClick={handleManageAdsClick}>
            <Users size={18} />
            <span>Manage Ads</span>
          </button>
          <button 
            className={`sidebar-item ${selectedTab === 'manage-surveys' ? 'active' : ''}`} 
            onClick={() => handleTabChange('manage-surveys')}
          >
            <Users size={18} />
            <span>Manage Surveys</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <header className="content-header">
          <div className="header-info">
            <h1>Analytics Dashboard for {getCurrentProjectName()}</h1>
            <div className="breadcrumb">DynaQ / Analytics / {selectedTab}</div>
          </div>
          <div className="header-actions">
            <div className="project-selector" ref={dropdownRef}>
              <button 
                onClick={toggleProjectDropdown}
                onBlur={(e) => {
                  // Only close if the focus is not moving to a dropdown item
                  if (!e.relatedTarget || !dropdownRef.current?.contains(e.relatedTarget as Node)) {
                    setTimeout(closeProjectDropdown, 150);
                  }
                }}
                className="project-dropdown-toggle"
                aria-expanded={isProjectDropdownOpen}
                aria-haspopup="listbox"
              >
                <span>{getCurrentProjectName()}</span>
                <ChevronDown size={16} />
              </button>
              {isProjectDropdownOpen && (
                <div className="project-dropdown" role="listbox">
                  {projects.filter(project => project.isActive).map((project) => (
                    <button
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                      onBlur={(e) => {
                        // Only close if focus is leaving the dropdown entirely
                        if (!e.relatedTarget || !dropdownRef.current?.contains(e.relatedTarget as Node)) {
                          setTimeout(closeProjectDropdown, 150);
                        }
                      }}
                      className={`project-dropdown-item ${project.id === currentProjectId ? 'active' : ''}`}
                      role="option"
                      aria-selected={project.id === currentProjectId}
                      tabIndex={0}
                    >
                      {project.name}
                    </button>
                  ))}
                  {projects.filter(project => project.isActive).length === 0 && (
                    <div className="project-dropdown-empty">
                      No active projects available
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

      <div className="dashboard-content">
        {selectedTab === 'overview' && (
          <OverviewTab analyticsData={analyticsData} projectId={currentProjectId} dateRange={dateRange} />
        )}

        {selectedTab === 'ads' && (
          <AdsAnalyticsTab analyticsData={analyticsData} projectId={currentProjectId} />
        )}

        {selectedTab === 'surveys' && (
          <SurveysAnalyticsTab analyticsData={analyticsData} projectId={currentProjectId} />
        )}

        {selectedTab === 'manage-ads' && (
          <div className="manage-ads-tab">
            <ManageAds projectId={currentProjectId} />
          </div>
        )}

        {selectedTab === 'manage-surveys' && (
          <div className="manage-surveys-tab">
            <ManageSurveys projectId={currentProjectId} />
          </div>
        )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isCreateProjectModalOpen}
        onClose={handleCloseCreateProjectModal}
        title="Create a New Project"
        maxWidth="500px"
      >
        <div className="create-project-form">
          <div className="form-group">
            <label htmlFor="project-name" className="form-label">
              Project Name
            </label>
            <input
              id="project-name"
              type="text"
              value={newProjectForm.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              placeholder="Enter project name"
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="project-description" className="form-label">
              Description
            </label>
            <textarea
              id="project-description"
              value={newProjectForm.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              placeholder="Enter project description"
              className="form-textarea"
              rows={4}
            />
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={handleSubmitProject}
              className="submit-button"
              disabled={isCreatingProject || !newProjectForm.name.trim()}
            >
              {isCreatingProject ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}; 