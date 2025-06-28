import React, { useState, useEffect, useRef } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  MousePointer, 
  Eye,
  Clock,
  Users
} from 'lucide-react';
import { AnalyticsData, apiService, TrackingEvent, Ad } from '../../services/apiService';

interface AdsAnalyticsTabProps {
  analyticsData: AnalyticsData | null;
  projectId: string;
}

interface AdTrackingData {
  adId: string;
  adTitle: string;
  events: TrackingEvent[];
  clickCount: number;
  impressionCount: number;
  lastActivity: string | null;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export const AdsAnalyticsTab: React.FC<AdsAnalyticsTabProps> = ({ analyticsData, projectId }) => {
  const [trackingData, setTrackingData] = useState<AdTrackingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef<string | null>(null); // Track which project is currently loading

  useEffect(() => {
    if (projectId && projectId !== loadingRef.current) {
      loadAdsTrackingData();
    }
  }, [projectId]);

  const loadAdsTrackingData = async () => {
    if (!projectId || loadingRef.current === projectId) return; // Prevent duplicate calls
    
    try {
      setLoading(true);
      setError(null);
      loadingRef.current = projectId; // Mark this project as loading
      
      console.log(`Loading ads tracking data for project: ${projectId}`);
      
      // First, get all ads for the project
      const ads = await apiService.getAdsByProject(projectId);
      console.log(`Found ${ads.length} ads for project`);
      
      if (ads.length === 0) {
        setTrackingData([]);
        return;
      }
      
      // For each ad, fetch its tracking events
      const adsTrackingPromises = ads.map(async (ad: Ad) => {
        try {
          const events = await apiService.getEventsByAd(ad.id, projectId);
          console.log(`Found ${events.length} events for ad ${ad.id}`);
          
          // Count clicks and impressions
          const clickCount = events.filter(event => event.eventType === 'ad_click').length;
          const impressionCount = events.filter(event => event.eventType === 'ad_impression').length;
          
          // Find last activity
          const lastActivity = events.length > 0 
            ? events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0].timestamp
            : null;
          
          return {
            adId: ad.id,
            adTitle: ad.title,
            events,
            clickCount,
            impressionCount,
            lastActivity
          };
        } catch (error) {
          console.error(`Failed to load tracking data for ad ${ad.id}:`, error);
          return {
            adId: ad.id,
            adTitle: ad.title,
            events: [],
            clickCount: 0,
            impressionCount: 0,
            lastActivity: null
          };
        }
      });
      
      const adsTrackingData = await Promise.all(adsTrackingPromises);
      setTrackingData(adsTrackingData);
      
    } catch (error) {
      console.error('Failed to load ads tracking data:', error);
      setError('Failed to load ads tracking data');
      setTrackingData([]);
    } finally {
      setLoading(false);
      loadingRef.current = null; // Reset loading state
    }
  };

  // Calculate aggregated stats
  const totalClicks = trackingData.reduce((sum, ad) => sum + ad.clickCount, 0);
  const totalImpressions = trackingData.reduce((sum, ad) => sum + ad.impressionCount, 0);
  const clickRate = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100) : 0;
  const activeAds = trackingData.filter(ad => ad.events.length > 0).length;
  
  // Prepare chart data
  const adPerformanceData = trackingData.map(ad => ({
    name: ad.adTitle.length > 20 ? ad.adTitle.substring(0, 20) + '...' : ad.adTitle,
    clicks: ad.clickCount,
    impressions: ad.impressionCount,
    adId: ad.adId
  }));

  // Prepare event timeline data (last 7 days)
  const getEventTimelineData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    const timelineData = last7Days.map(date => {
      const dayEvents = trackingData.flatMap(ad => ad.events)
        .filter(event => event.timestamp.startsWith(date));
      
      return {
        date: date,
        clicks: dayEvents.filter(e => e.eventType === 'ad_click').length,
        impressions: dayEvents.filter(e => e.eventType === 'ad_impression').length
      };
    });

    return timelineData;
  };

  // Prepare click distribution data for pie chart
  const clickDistributionData = trackingData
    .filter(ad => ad.clickCount > 0)
    .map((ad, index) => ({
      name: ad.adTitle.length > 15 ? ad.adTitle.substring(0, 15) + '...' : ad.adTitle,
      value: ad.clickCount,
      color: COLORS[index % COLORS.length]
    }));

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading ads tracking data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message">
        <p>{error}</p>
        <button onClick={loadAdsTrackingData} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="ads-tab">
      <div className="ads-stats">
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
            <MousePointer />
          </div>
          <div className="stat-content">
            <h3>Total Clicks</h3>
            <p className="stat-number">{totalClicks}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon">
            <TrendingUp />
          </div>
          <div className="stat-content">
            <h3>Click Rate</h3>
            <p className="stat-number">{clickRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Users />
          </div>
          <div className="stat-content">
            <h3>Active Ads</h3>
            <p className="stat-number">{activeAds} / {trackingData.length}</p>
          </div>
        </div>
      </div>

      {trackingData.length === 0 ? (
        <div className="chart-card">
          <div className="chart-description">
            No ads found for this project. Create some ads to see tracking analytics.
          </div>
        </div>
      ) : (
        <>
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Ad Performance Comparison</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={adPerformanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="impressions" fill="#10b981" name="Impressions" />
                  <Bar dataKey="clicks" fill="#3b82f6" name="Clicks" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Click Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                {clickDistributionData.length > 0 ? (
                  <PieChart>
                    <Pie
                      data={clickDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {clickDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                ) : (
                  <div className="chart-description">
                    No click data available yet.
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
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" name="Clicks" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Activity Table */}
          <div className="chart-card">
            <h3>Recent Ad Activity</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Ad Title</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Total Events</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Clicks</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Impressions</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '600', color: '#64748b' }}>Last Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingData.map((ad) => (
                    <tr key={ad.adId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{ad.adTitle}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{ad.events.length}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{ad.clickCount}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>{ad.impressionCount}</td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {ad.lastActivity 
                          ? new Date(ad.lastActivity).toLocaleDateString() + ' ' + new Date(ad.lastActivity).toLocaleTimeString()
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