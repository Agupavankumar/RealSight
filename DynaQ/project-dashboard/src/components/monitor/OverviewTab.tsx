import React, { useState, useEffect, useRef } from 'react';
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
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { 
  TrendingUp, 
  MousePointer, 
  Send,
  Eye,
  Users,
  Activity,
  Calendar,
  Clock
} from 'lucide-react';
import { AnalyticsData, apiService, TrackingEvent, Ad, Survey } from '../../services/apiService';

interface OverviewTabProps {
  analyticsData: AnalyticsData | null;
  projectId: string;
  dateRange: { from: Date; to: Date };
}

interface ProcessedOverviewData {
  totalEvents: number;
  uniqueUsers: number;
  totalAdClicks: number;
  totalAdImpressions: number;
  totalSurveyImpressions: number;
  totalSurveyStarts: number;
  totalSurveySubmissions: number;
  eventTypeDistribution: { name: string; value: number; color: string }[];
  timelineData: { date: string; adEvents: number; surveyEvents: number; totalEvents: number }[];
  topAds: { name: string; clicks: number; impressions: number }[];
  topSurveys: { name: string; submissions: number; completionRate: number }[];
  recentActivity: { type: string; content: string; timestamp: string; eventType: string }[];
  userEngagementFunnel: { name: string; value: number; fill: string }[];
  dailyActivityHeatmap: { date: string; count: number; day: string }[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const OverviewTab: React.FC<OverviewTabProps> = ({ analyticsData, projectId, dateRange }) => {
  const [overviewData, setOverviewData] = useState<ProcessedOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null);

  useEffect(() => {
    if (projectId && projectId !== loadingRef.current) {
      loadOverviewData();
    }
  }, [projectId, dateRange]);

  const loadOverviewData = async () => {
    if (!projectId || loadingRef.current === projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      loadingRef.current = projectId;
      
      console.log(`Loading overview data for project: ${projectId}`);
      
      // Load all data in parallel
      const [events, ads, surveys] = await Promise.all([
        apiService.getEventsByProject(projectId, dateRange.from, dateRange.to),
        apiService.getAdsByProject(projectId).catch(() => []),
        apiService.getSurveysByProject(projectId).catch(() => [])
      ]);
      
      console.log(`Found ${events.length} events, ${ads.length} ads, ${surveys.length} surveys`);
      
      const processedData = processOverviewData(events, ads, surveys);
      setOverviewData(processedData);
      
    } catch (error) {
      console.error('Failed to load overview data:', error);
      setError('Failed to load overview data');
      setOverviewData(null);
    } finally {
      setLoading(false);
      loadingRef.current = null;
    }
  };

  const processOverviewData = (events: TrackingEvent[], ads: Ad[], surveys: Survey[]): ProcessedOverviewData => {
    // Basic metrics
    const totalEvents = events.length;
    const uniqueUsers = new Set(events.map(e => e.sessionId).filter(Boolean)).size;
    
    // Event type counts
    const adClicks = events.filter(e => e.eventType === 'ad_click').length;
    const adImpressions = events.filter(e => e.eventType === 'ad_impression').length;
    const surveyImpressions = events.filter(e => e.eventType === 'survey_impression').length;
    const surveyStarts = events.filter(e => e.eventType === 'survey_start').length;
    const surveySubmissions = events.filter(e => e.eventType === 'survey_submission').length;
    
    // Event type distribution for pie chart
    const eventTypeDistribution = [
      { name: 'Ad Clicks', value: adClicks, color: COLORS[0] },
      { name: 'Ad Impressions', value: adImpressions, color: COLORS[1] },
      { name: 'Survey Impressions', value: surveyImpressions, color: COLORS[2] },
      { name: 'Survey Starts', value: surveyStarts, color: COLORS[3] },
      { name: 'Survey Submissions', value: surveySubmissions, color: COLORS[4] }
    ].filter(item => item.value > 0);
    
    // Timeline data (last 7 days)
    const timelineData = generateTimelineData(events);
    
    // Top performing ads
    const adPerformance = ads.map(ad => {
      const adEvents = events.filter(e => e.adId === ad.id);
      const clicks = adEvents.filter(e => e.eventType === 'ad_click').length;
      const impressions = adEvents.filter(e => e.eventType === 'ad_impression').length;
      
      return {
        name: ad.title.length > 20 ? ad.title.substring(0, 20) + '...' : ad.title,
        clicks,
        impressions,
        adId: ad.id
      };
    }).sort((a, b) => b.clicks - a.clicks).slice(0, 5);
    
    // Top performing surveys
    const surveyPerformance = surveys.map(survey => {
      const surveyEvents = events.filter(e => e.surveyId === survey.id);
      const starts = surveyEvents.filter(e => e.eventType === 'survey_start').length;
      const submissions = surveyEvents.filter(e => e.eventType === 'survey_submission').length;
      const completionRate = starts > 0 ? (submissions / starts) * 100 : 0;
      
      return {
        name: survey.title.length > 20 ? survey.title.substring(0, 20) + '...' : survey.title,
        submissions,
        completionRate,
        surveyId: survey.id
      };
    }).sort((a, b) => b.submissions - a.submissions).slice(0, 5);
    
    // Recent activity (last 10 events)
    const recentActivity = events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10)
      .map(event => {
        let content = 'Unknown';
        if (event.adId) {
          const ad = ads.find(a => a.id === event.adId);
          content = ad ? ad.title : `Ad ${event.adId.substring(0, 8)}...`;
        } else if (event.surveyId) {
          const survey = surveys.find(s => s.id === event.surveyId);
          content = survey ? survey.title : `Survey ${event.surveyId.substring(0, 8)}...`;
        }
        
        return {
          type: event.eventType.includes('ad') ? 'Ad' : 'Survey',
          content,
          timestamp: event.timestamp,
          eventType: event.eventType
        };
      });
    
    // User engagement funnel
    const userEngagementFunnel = [
      { name: 'Impressions', value: adImpressions + surveyImpressions, fill: COLORS[1] },
      { name: 'Interactions', value: adClicks + surveyStarts, fill: COLORS[2] },
      { name: 'Conversions', value: surveySubmissions, fill: COLORS[0] }
    ].filter(item => item.value > 0);
    
    // Daily activity heatmap (last 30 days)
    const dailyActivityHeatmap = generateHeatmapData(events);
    
    return {
      totalEvents,
      uniqueUsers,
      totalAdClicks: adClicks,
      totalAdImpressions: adImpressions,
      totalSurveyImpressions: surveyImpressions,
      totalSurveyStarts: surveyStarts,
      totalSurveySubmissions: surveySubmissions,
      eventTypeDistribution,
      timelineData,
      topAds: adPerformance,
      topSurveys: surveyPerformance,
      recentActivity,
      userEngagementFunnel,
      dailyActivityHeatmap
    };
  };

  const generateTimelineData = (events: TrackingEvent[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayEvents = events.filter(event => event.timestamp.startsWith(date));
      const adEvents = dayEvents.filter(e => e.eventType.includes('ad')).length;
      const surveyEvents = dayEvents.filter(e => e.eventType.includes('survey')).length;
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        adEvents,
        surveyEvents,
        totalEvents: dayEvents.length
      };
    });
  };

  const generateHeatmapData = (events: TrackingEvent[]) => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        day: date.toLocaleDateString('en-US', { weekday: 'short' })
      };
    });

    return last30Days.map(({ date, day }) => {
      const dayEvents = events.filter(event => event.timestamp.startsWith(date));
      return {
        date,
        count: dayEvents.length,
        day
      };
    });
  };

  const formatEventType = (eventType: string) => {
    return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getEventTypeColor = (eventType: string) => {
    if (eventType.includes('ad')) return '#3b82f6';
    if (eventType.includes('survey')) return '#10b981';
    return '#64748b';
  };

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading overview data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={loadOverviewData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  if (!overviewData) {
    return (
      <div className="chart-card">
        <div className="chart-description">
          No data available for this project.
        </div>
      </div>
    );
  }

  return (
    <div className="overview-tab">
      {/* High-Level Metrics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <Activity />
          </div>
          <div className="stat-content">
            <h3>Total Events</h3>
            <p className="stat-number">{overviewData.totalEvents}</p>
          </div>
        </div>
        

        <div className="stat-card">
          <div className="stat-icon">
            <MousePointer />
          </div>
          <div className="stat-content">
            <h3>Ad Interactions</h3>
            <p className="stat-number">{overviewData.totalAdClicks + overviewData.totalAdImpressions}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <Send />
          </div>
          <div className="stat-content">
            <h3>Survey Completions</h3>
            <p className="stat-number">{overviewData.totalSurveySubmissions}</p>
          </div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="charts-grid">
        {/* Activity Timeline */}
        <div className="chart-card">
          <h3>Activity Timeline (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={overviewData.timelineData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="adEvents" stroke={COLORS[0]} name="Ad Events" strokeWidth={2} />
              <Line type="monotone" dataKey="surveyEvents" stroke={COLORS[1]} name="Survey Events" strokeWidth={2} />
              <Line type="monotone" dataKey="totalEvents" stroke={COLORS[2]} name="Total Events" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Event Type Distribution */}
        <div className="chart-card">
          <h3>Event Type Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            {overviewData.eventTypeDistribution.length > 0 ? (
              <PieChart>
                <Pie
                  data={overviewData.eventTypeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {overviewData.eventTypeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : (
              <div className="chart-description">No events recorded yet.</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Performance Charts */}
      <div className="charts-grid">
        {/* Top Performing Ads */}
        <div className="chart-card">
          <h3>Top Performing Ads</h3>
          <ResponsiveContainer width="100%" height={300}>
            {overviewData.topAds.length > 0 ? (
              <BarChart data={overviewData.topAds}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="impressions" fill={COLORS[1]} name="Impressions" />
                <Bar dataKey="clicks" fill={COLORS[0]} name="Clicks" />
              </BarChart>
            ) : (
              <div className="chart-description">No ad performance data available.</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Top Performing Surveys */}
        <div className="chart-card">
          <h3>Top Performing Surveys</h3>
          <ResponsiveContainer width="100%" height={300}>
            {overviewData.topSurveys.length > 0 ? (
              <BarChart data={overviewData.topSurveys}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="submissions" fill={COLORS[0]} name="Submissions" />
              </BarChart>
            ) : (
              <div className="chart-description">No survey performance data available.</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* User Engagement Funnel */}
      {overviewData.userEngagementFunnel.length > 0 && (
        <div className="chart-card">
          <h3>User Engagement Funnel</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={overviewData.userEngagementFunnel} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Activity Feed */}
      <div className="chart-card">
        <h3>Recent Activity</h3>
        {overviewData.recentActivity.length > 0 ? (
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {overviewData.recentActivity.map((activity, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                padding: '12px 0', 
                borderBottom: '1px solid #f1f5f9' 
              }}>
                <div style={{ 
                  width: '8px', 
                  height: '8px', 
                  borderRadius: '50%', 
                  backgroundColor: getEventTypeColor(activity.eventType),
                  marginRight: '12px',
                  flexShrink: 0
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1e293b' }}>
                    {formatEventType(activity.eventType)} - {activity.content}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  padding: '4px 8px', 
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  color: '#64748b'
                }}>
                  {activity.type}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="chart-description">No recent activity to display.</div>
        )}
      </div>
    </div>
  );
}; 