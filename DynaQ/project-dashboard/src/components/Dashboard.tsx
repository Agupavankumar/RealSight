import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  MousePointer, 
  Eye, 
  FileText, 
  Send,
  Menu,
  X
} from 'lucide-react';
import { apiService, AnalyticsData } from '../services/apiService';
import './Dashboard.css';

interface DashboardProps {
  projectId?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ projectId = 'default-project' }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'ads' | 'surveys'>('overview');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [projectId, dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getAnalytics(projectId, dateRange.from, dateRange.to);
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

  const handleTabChange = (tab: 'overview' | 'ads' | 'surveys') => {
    setSelectedTab(tab);
    setIsMenuOpen(false); // Close menu after selection
  };

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

  const pieData = [
    { name: 'Ad Clicks', value: analyticsData?.adClicks || 0, color: '#3b82f6' },
    { name: 'Ad Impressions', value: analyticsData?.adImpressions || 0, color: '#10b981' },
    { name: 'Survey Impressions', value: analyticsData?.surveyImpressions || 0, color: '#f59e0b' },
    { name: 'Survey Submissions', value: analyticsData?.surveySubmissions || 0, color: '#ef4444' },
  ];

  return (
    <div className="dashboard-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h2>DynaQ Analytics</h2>
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
          <div className="section-title">Insights</div>
          <button className="sidebar-item">
            <Users size={18} />
            <span>User Segments</span>
          </button>
          <button className="sidebar-item">
            <Eye size={18} />
            <span>Events</span>
          </button>
        </div>
      </nav>

      <div className="main-content">
        <header className="content-header">
          <div className="header-info">
            <h1>Analytics Dashboard for Project</h1>
            <div className="breadcrumb">DynaQ / Analytics / {selectedTab}</div>
          </div>
          <div className="header-actions">
            <div className="date-range-selector">
              <button 
                onClick={() => handleDateRangeChange(7)}
                className={dateRange.from.getTime() === Date.now() - 7 * 24 * 60 * 60 * 1000 ? 'active' : ''}
              >
                7 Days
              </button>
              <button 
                onClick={() => handleDateRangeChange(30)}
                className={dateRange.from.getTime() === Date.now() - 30 * 24 * 60 * 60 * 1000 ? 'active' : ''}
              >
                30 Days
              </button>
              <button 
                onClick={() => handleDateRangeChange(90)}
                className={dateRange.from.getTime() === Date.now() - 90 * 24 * 60 * 60 * 1000 ? 'active' : ''}
              >
                90 Days
              </button>
            </div>
          </div>
        </header>

      <div className="dashboard-content">
        {selectedTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp />
                </div>
                <div className="stat-content">
                  <h3>Total Events</h3>
                  <p className="stat-number">{analyticsData?.totalEvents || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Users />
                </div>
                <div className="stat-content">
                  <h3>Distinct Users</h3>
                  <p className="stat-number">{analyticsData?.distinctUsers || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <MousePointer />
                </div>
                <div className="stat-content">
                  <h3>Ad Clicks</h3>
                  <p className="stat-number">{analyticsData?.adClicks || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Send />
                </div>
                <div className="stat-content">
                  <h3>Survey Submissions</h3>
                  <p className="stat-number">{analyticsData?.surveySubmissions || 0}</p>
                </div>
              </div>
            </div>

            <div className="charts-grid">
              <div className="chart-card">
                <h3>Events Over Time</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData?.eventsOverTime || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3>Event Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'ads' && (
          <div className="ads-tab">
            <div className="ads-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Eye />
                </div>
                <div className="stat-content">
                  <h3>Ad Impressions</h3>
                  <p className="stat-number">{analyticsData?.adImpressions || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <MousePointer />
                </div>
                <div className="stat-content">
                  <h3>Ad Clicks</h3>
                  <p className="stat-number">{analyticsData?.adClicks || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp />
                </div>
                <div className="stat-content">
                  <h3>Click Rate</h3>
                  <p className="stat-number">
                    {analyticsData?.adImpressions 
                      ? ((analyticsData.adClicks / analyticsData.adImpressions) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Top Performing Ads</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.topAds || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="adId" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="clicks" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {selectedTab === 'surveys' && (
          <div className="surveys-tab">
            <div className="surveys-stats">
              <div className="stat-card">
                <div className="stat-icon">
                  <Eye />
                </div>
                <div className="stat-content">
                  <h3>Survey Impressions</h3>
                  <p className="stat-number">{analyticsData?.surveyImpressions || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <Send />
                </div>
                <div className="stat-content">
                  <h3>Survey Submissions</h3>
                  <p className="stat-number">{analyticsData?.surveySubmissions || 0}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon">
                  <TrendingUp />
                </div>
                <div className="stat-content">
                  <h3>Completion Rate</h3>
                  <p className="stat-number">
                    {analyticsData?.surveyImpressions 
                      ? ((analyticsData.surveySubmissions / analyticsData.surveyImpressions) * 100).toFixed(1) + '%'
                      : '0%'
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="chart-card">
              <h3>Survey Performance</h3>
              <p className="chart-description">
                Survey analytics will be displayed here once survey tracking is implemented.
              </p>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}; 