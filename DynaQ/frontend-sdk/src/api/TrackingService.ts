import { createApiClient, type ApiClient, type ApiResponse } from './ApiClient';

export interface TrackingEventRequest {
  eventType: string;
  eventId: string;
  projectId: string;
  adId?: string;
  surveyId?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export interface TrackingEventResponse {
  success: boolean;
  error?: string;
  eventId: string;
}

export interface TrackingService {
  trackEvent: (eventData: TrackingEventRequest) => Promise<ApiResponse<TrackingEventResponse>>;
  getEventsByProject: (projectId: string, fromDate?: Date, toDate?: Date) => Promise<ApiResponse<any[]>>;
  getEventsByAd: (adId: string, projectId: string) => Promise<ApiResponse<any[]>>;
}

export function createTrackingService(baseUrl?: string): TrackingService {
  const apiClient = createApiClient({ baseUrl });
  
  return {
    async trackEvent(eventData: TrackingEventRequest): Promise<ApiResponse<TrackingEventResponse>> {
      return apiClient.post<TrackingEventResponse>('/api/tracking/events', eventData);
    },

    async getEventsByProject(projectId: string, fromDate?: Date, toDate?: Date): Promise<ApiResponse<any[]>> {
      let endpoint = `/api/tracking/events/project/${projectId}`;
      const params = new URLSearchParams();
      
      if (fromDate) {
        params.append('fromDate', fromDate.toISOString());
      }
      if (toDate) {
        params.append('toDate', toDate.toISOString());
      }
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }
      
      return apiClient.get<any[]>(endpoint);
    },

    async getEventsByAd(adId: string, projectId: string): Promise<ApiResponse<any[]>> {
      return apiClient.get<any[]>(`/api/tracking/events/ad/${adId}?projectId=${projectId}`);
    },
  };
} 