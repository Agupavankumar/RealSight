import axios from 'axios';

const API_BASE_URL = 'http://localhost:5008/api'; // Backend URL from launchSettings.json
const USE_MOCK_DATA = false; // Set to false to use real backend API

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

export interface Project {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Ad {
  id: string;
  projectId: string;
  title: string;
  content: string;
  brandName: string;
  imageUrl?: string;
  clickUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Survey {
  id: string;
  projectId: string;
  title: string;
  description: string;
  questions: SurveyQuestion[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurveyQuestion {
  id: string;
  question: string;
  type: 'text' | 'multiple_choice' | 'rating' | 'boolean';
  required?: boolean;
  options?: string[];
  maxRating?: number;
  order?: number;
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

// Add interfaces to match backend request structure
export interface CreateSurveyRequest {
  title: string;
  description?: string;
  projectId: string;
  questions: CreateQuestionRequest[];
}

export interface CreateQuestionRequest {
  question: string;
  type: number; // Enum value: 0=Text, 1=MultipleChoice, 2=Rating, 3=Boolean
  required: boolean;
  options?: string[];
  maxRating?: number;
  order: number;
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

  async getEventsBySurvey(surveyId: string, projectId: string): Promise<TrackingEvent[]> {
    if (USE_MOCK_DATA) {
      // Return mock survey events for UI testing
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return [
        {
          id: '1',
          eventType: 'survey_impression',
          eventId: 'impression-001',
          projectId,
          surveyId,
          timestamp: '2024-01-28T10:30:00Z',
          sessionId: 'session-123',
        },
      ];
    }

    const response = await this.axiosInstance.get(
      `/tracking/events/survey/${surveyId}?projectId=${projectId}`
    );
    return response.data;
  }

  async getAnalytics(projectId: string, fromDate?: Date, toDate?: Date): Promise<AnalyticsData> {
    // For now, return mock data since we need to process raw tracking events
    // In a real implementation, you would either:
    // 1. Create a dedicated analytics endpoint in the backend
    // 2. Process the raw tracking events here to generate analytics
    
    return {
      totalEvents: 0,
      adClicks: 0,
      adImpressions: 0,
      surveyImpressions: 0,
      surveySubmissions: 0,
      distinctUsers: 0,
      eventsOverTime: [],
      topAds: [],
    };
  }

  async getAllProjects(): Promise<ProjectSummary[]> {
    const response = await this.axiosInstance.get('/Projects');
    return response.data;
  }

  async getProject(projectId: string): Promise<Project | null> {
    try {
      const response = await this.axiosInstance.get(`/Projects/${projectId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      return null;
    }
  }

  async createProject(projectData: { name: string; description: string }): Promise<Project> {
    const response = await this.axiosInstance.post('/Projects', projectData);
    return response.data;
  }

  async getAdsByProject(projectId: string): Promise<Ad[]> {
    const response = await this.axiosInstance.get(`/Ads/project/${projectId}`);
    return response.data;
  }

  async createAd(adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ad> {
    const payload = {
      title: adData.title,
      content: adData.content,
      brandName: adData.brandName,
      imageUrl: adData.imageUrl,
      clickUrl: adData.clickUrl,
      projectId: adData.projectId,
      isActive: adData.isActive
    };
    
    const response = await this.axiosInstance.post('/Ads', payload);
    return response.data;
  }

  async deleteAd(adId: string, projectId: string): Promise<void> {
    await this.axiosInstance.delete(`/Ads/${adId}?projectId=${projectId}`);
  }

  async getSurveysByProject(projectId: string): Promise<Survey[]> {
    const response = await this.axiosInstance.get(`/Survey/project/${projectId}`);
    return response.data;
  }

  async createSurvey(surveyData: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>): Promise<Survey> {
    // Transform the survey data to match backend expectations
    const payload: CreateSurveyRequest = {
      title: surveyData.title,
      description: surveyData.description,
      projectId: surveyData.projectId,
      questions: surveyData.questions.map((q, index): CreateQuestionRequest => ({
        question: q.question,
        type: q.type === 'text' ? 0 : 
              q.type === 'multiple_choice' ? 1 : 
              q.type === 'rating' ? 2 : 
              3, // boolean
        required: q.required || false,
        options: q.options,
        maxRating: q.maxRating,
        order: q.order || index
      }))
    };
    
    const response = await this.axiosInstance.post('/Survey', payload);
    
    // Transform the response back to our interface
    const created = response.data;
    return {
      ...created,
      questions: created.questions.map((q: any) => ({
        ...q,
        type: q.type === 0 ? 'text' : 
              q.type === 1 ? 'multiple_choice' : 
              q.type === 2 ? 'rating' : 
              'boolean'
      }))
    };
  }

  async deleteSurvey(surveyId: string, projectId: string): Promise<void> {
    await this.axiosInstance.delete(`/Survey/${surveyId}?projectId=${projectId}`);
  }
}

export const apiService = new ApiService(); 