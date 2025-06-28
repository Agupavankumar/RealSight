import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Eye, 
  Send,
  Users,
  FileText
} from 'lucide-react';
import { AnalyticsData, apiService, TrackingEvent, Survey } from '../../services/apiService';

interface SurveysAnalyticsTabProps {
  analyticsData: AnalyticsData | null;
  projectId: string;
}

interface SurveyTrackingData {
  surveyId: string;
  surveyTitle: string;
  events: TrackingEvent[];
  impressionCount: number;
  submissionCount: number;
  startCount: number;
  completionRate: number;
  lastActivity: string | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const SurveysAnalyticsTab: React.FC<SurveysAnalyticsTabProps> = ({ analyticsData, projectId }) => {
  const [trackingData, setTrackingData] = useState<SurveyTrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null); // Track which project is currently loading

  useEffect(() => {
    if (projectId && projectId !== loadingRef.current) {
      loadSurveysTrackingData();
    }
  }, [projectId]);

  const loadSurveysTrackingData = async () => {
    if (!projectId || loadingRef.current === projectId) return; // Prevent duplicate calls
    
    try {
      setLoading(true);
      setError(null);
      loadingRef.current = projectId; // Mark this project as loading
      
      console.log(`Loading surveys tracking data for project: ${projectId}`);
      
      // First, get all surveys for the project
      const surveys = await apiService.getSurveysByProject(projectId);
      console.log(`Found ${surveys.length} surveys for project`);
      
      if (surveys.length === 0) {
        setTrackingData([]);
        return;
      }
      
      // For each survey, fetch its tracking events
      const surveysTrackingPromises = surveys.map(async (survey: Survey) => {
        try {
          const events = await apiService.getEventsBySurvey(survey.id, projectId);
          console.log(`Found ${events.length} events for survey ${survey.id}`);
          
          // Count different event types
          const impressionCount = events.filter(event => event.eventType === 'survey_impression').length;
          const submissionCount = events.filter(event => event.eventType === 'survey_submission').length;
          const startCount = events.filter(event => event.eventType === 'survey_start').length;
          
          // Calculate completion rate
          const completionRate = startCount > 0 ? ((submissionCount / startCount) * 100) : 0;
          
          // Find last activity
          const lastActivity = events.length > 0 
            ? events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
            : null;
          
          return {
            surveyId: survey.id,
            surveyTitle: survey.title,
            events,
            impressionCount,
            submissionCount,
            startCount,
            completionRate,
            lastActivity
          };
        } catch (error) {
          console.error(`Failed to load tracking data for survey ${survey.id}:`, error);
          return {
            surveyId: survey.id,
            surveyTitle: survey.title,
            events: [],
            impressionCount: 0,
            submissionCount: 0,
            startCount: 0,
            completionRate: 0,
            lastActivity: null
          };
        }
      });
      
      const surveysTrackingData = await Promise.all(surveysTrackingPromises);
      setTrackingData(surveysTrackingData);
      
    } catch (error) {
      console.error('Failed to load surveys tracking data:', error);
      setError('Failed to load surveys tracking data');
      setTrackingData([]);
    } finally {
      setLoading(false);
      loadingRef.current = null; // Reset loading state
    }
  };

  // Calculate aggregated stats
  const totalImpressions = trackingData.reduce((sum, survey) => sum + survey.impressionCount, 0);
  const totalSubmissions = trackingData.reduce((sum, survey) => sum + survey.submissionCount, 0);
  const totalStarts = trackingData.reduce((sum, survey) => sum + survey.startCount, 0);
  const overallCompletionRate = totalStarts > 0 ? ((totalSubmissions / totalStarts) * 100) : 0;
  const activeSurveys = trackingData.filter(survey => survey.events.length > 0).length;
  
  // Prepare chart data
  const surveyPerformanceData = trackingData.map(survey => ({
    name: survey.surveyTitle.length > 20 ? survey.surveyTitle.substring(0, 20) + '...' : survey.surveyTitle,
    impressions: survey.impressionCount,
    starts: survey.startCount,
    submissions: survey.submissionCount,
    completionRate: survey.completionRate,
    surveyId: survey.surveyId
  }));

  // Prepare event timeline data (last 7 days)
  const getEventTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const timelineData = last7Days.map(date => {
      const dayEvents = trackingData.flatMap(survey => survey.events)
        .filter(event => event.timestamp.startsWith(date));
      
      return {
        date: date,
        impressions: dayEvents.filter(e => e.eventType === 'survey_impression').length,
        starts: dayEvents.filter(e => e.eventType === 'survey_start').length,
        submissions: dayEvents.filter(e => e.eventType === 'survey_submission').length
      };
    });

    return timelineData;
  };

  // Prepare submission distribution data for pie chart
  const submissionDistributionData = trackingData
    .filter(survey => survey.submissionCount > 0)
    .map((survey, index) => ({
      name: survey.surveyTitle.length > 15 ? survey.surveyTitle.substring(0, 15) + '...' : survey.surveyTitle,
      value: survey.submissionCount,
      color: COLORS[index % COLORS.length]
    }));

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading surveys tracking data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={loadSurveysTrackingData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="surveys-tab">
      <div className="surveys-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <Eye />
          </div>
          <div className="stat-content">
            <h3>Total Impressions</h3>
            <p className="stat-number">{totalImpressions}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Send />
          </div>
          <div className="stat-content">
            <h3>Total Submissions</h3>
            <p className="stat-number">{totalSubmissions}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>Completion Rate</h3>
            <p className="stat-number">{overallCompletionRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>Active Surveys</h3>
            <p className="stat-number">{activeSurveys} / {trackingData.length}</p>
          </div>
        </div>
      </div>

      {trackingData.length === 0 ? (
        <div className="chart-card">
          <div className="chart-description">
            No surveys found for this project. Create some surveys to see tracking analytics.
          </div>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Survey Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={surveyPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impressions" fill="#10b981" name="Impressions" />
                  <Bar dataKey="starts" fill="#f59e0b" name="Starts" />
                  <Bar dataKey="submissions" fill="#3b82f6" name="Submissions" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Submission Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                {submissionDistributionData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={submissionDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {submissionDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <div className="chart-description">
                    No submission data available yet.
                  </div>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <h3>Activity Timeline (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={getEventTimelineData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="impressions" stroke="#10b981" name="Impressions" />
                <Line type="monotone" dataKey="starts" stroke="#f59e0b" name="Starts" />
                <Line type="monotone" dataKey="submissions" stroke="#3b82f6" name="Submissions" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Completion Rate Comparison Chart */}
          <div className="chart-card">
            <h3>Completion Rate by Survey</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={surveyPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Completion Rate']} />
                <Legend />
                <Bar dataKey="completionRate" fill="#8b5cf6" name="Completion Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity Table */}
          <div className="chart-card">
            <h3>Survey Performance Summary</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Survey Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Total Events</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Impressions</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Starts</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Submissions</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Completion Rate</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingData.map((survey) => (
                    <tr key={survey.surveyId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{survey.surveyTitle}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{survey.events.length}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{survey.impressionCount}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{survey.startCount}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{survey.submissionCount}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{survey.completionRate.toFixed(1)}%</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {survey.lastActivity 
                          ? new Date(survey.lastActivity).toLocaleDateString() + ' ' + new Date(survey.lastActivity).toLocaleTimeString()
                          : 'No activity'
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}; 