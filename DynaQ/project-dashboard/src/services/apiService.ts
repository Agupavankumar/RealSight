import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api'; // Adjust based on your backend URL
const USE_MOCK_DATA = true; // Set to false when backend is ready

export interface TrackingEvent {
  id: string;
  eventType: string;
  eventId: string;
  projectId: string;
  adId?: string;
  surveyId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
  sessionId?: string;
}

export interface AnalyticsData {
  totalEvents: number;
  adClicks: number;
  adImpressions: number;
  surveyImpressions: number;
  surveySubmissions: number;
  distinctUsers: number;
  eventsOverTime: { date: string; count: number }[];
  topAds: { adId: string; clicks: number }[];
}

class ApiService {
  private axiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  async getEventsByProject(
    projectId: string, 
    fromDate?: Date, 
    toDate?: Date
  ): Promise<TrackingEvent[]> {
    if (USE_MOCK_DATA) {
      // Return mock events for UI testing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: '1',
          eventType: 'ad_click',
          eventId: 'click-001',
          projectId,
          adId: 'ad-001',
          timestamp: '2024-01-28T10:30:00Z',
          sessionId: 'session-123',
        },
        {
          id: '2',
          eventType: 'ad_impression',
          eventId: 'imp-001',
          projectId,
          adId: 'ad-001',
          timestamp: '2024-01-28T10:25:00Z',
          sessionId: 'session-123',
        },
        // Add more mock events as needed...
      ];
    }

    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());

    const response = await this.axiosInstance.get(
      `/tracking/events/project/${projectId}?${params.toString()}`
    );
    return response.data;
  }

  async getEventsByAd(adId: string, projectId: string): Promise<TrackingEvent[]> {
    if (USE_MOCK_DATA) {
      // Return mock ad events for UI testing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: '1',
          eventType: 'ad_click',
          eventId: 'click-001',
          projectId,
          adId,
          timestamp: '2024-01-28T10:30:00Z',
          sessionId: 'session-123',
        },
      ];
    }

    const response = await this.axiosInstance.get(
      `/tracking/events/ad/${adId}?projectId=${projectId}`
    );
    return response.data;
  }

  async getAnalytics(projectId: string, fromDate?: Date, toDate?: Date): Promise<AnalyticsData> {
    if (USE_MOCK_DATA) {
      // Return mock data for UI testing
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      return {
        totalEvents: 2847,
        adClicks: 342,
        adImpressions: 1523,
        surveyImpressions: 456,
        surveySubmissions: 128,
        distinctUsers: 1205,
        eventsOverTime: [
          { date: '2024-01-15', count: 45 },
          { date: '2024-01-16', count: 52 },
          { date: '2024-01-17', count: 38 },
          { date: '2024-01-18', count: 67 },
          { date: '2024-01-19', count: 83 },
          { date: '2024-01-20', count: 74 },
          { date: '2024-01-21', count: 91 },
          { date: '2024-01-22', count: 105 },
          { date: '2024-01-23', count: 87 },
          { date: '2024-01-24', count: 98 },
          { date: '2024-01-25', count: 112 },
          { date: '2024-01-26', count: 89 },
          { date: '2024-01-27', count: 76 },
          { date: '2024-01-28', count: 94 },
        ],
        topAds: [
          { adId: 'ad-001', clicks: 89 },
          { adId: 'ad-002', clicks: 67 },
          { adId: 'ad-003', clicks: 54 },
          { adId: 'ad-004', clicks: 43 },
          { adId: 'ad-005', clicks: 35 },
          { adId: 'ad-006', clicks: 28 },
          { adId: 'ad-007', clicks: 21 },
          { adId: 'ad-008', clicks: 15 },
        ],
      };
    }

    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate.toISOString());
    if (toDate) params.append('toDate', toDate.toISOString());

    const response = await this.axiosInstance.get(
      `/tracking/analytics/${projectId}?${params.toString()}`
    );
    
    // Map backend response to frontend interface
    const backendData = response.data;
    return {
      totalEvents: backendData.totalEvents,
      adClicks: backendData.adClicks,
      adImpressions: backendData.adImpressions,
      surveyImpressions: backendData.surveyImpressions,
      surveySubmissions: backendData.surveySubmissions,
      distinctUsers: backendData.distinctUsers,
      eventsOverTime: backendData.eventsOverTime,
      topAds: backendData.topAds,
    };
  }


}

export const apiService = new ApiService(); 