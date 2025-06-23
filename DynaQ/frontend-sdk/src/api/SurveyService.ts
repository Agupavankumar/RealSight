import { ApiClient, ApiResponse } from './ApiClient';

// Question type enum values to match backend
export const QuestionType = {
  Text: 0,
  MultipleChoice: 1,
  Rating: 2,
  Boolean: 3
} as const;

export interface SurveyQuestion {
  id: string;
  type: 0 | 1 | 2 | 3; // 0=Text, 1=MultipleChoice, 2=Rating, 3=Boolean
  question: string;
  required: boolean;
  options?: string[];
  maxRating?: number;
  order: number;
}

export interface SurveyConfig {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  questions: SurveyQuestion[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface SurveyResponse {
  questionId: string;
  answer: string;
}

export interface SubmitSurveyRequest {
  surveyId: string;
  projectId: string;
  responses: SurveyResponse[];
  sessionId?: string;
}

export class SurveyService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Get survey configuration by ID and project
   */
  async getSurvey(surveyId: string, projectId: string): Promise<SurveyConfig> {
    const response = await this.apiClient.get<SurveyConfig>(`/api/survey/${surveyId}?projectId=${projectId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch survey');
    }
    return response.data;
  }

  /**
   * Get all surveys for a project
   */
  async getSurveysByProject(projectId: string): Promise<SurveyConfig[]> {
    const response = await this.apiClient.get<SurveyConfig[]>(`/api/survey/project/${projectId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch surveys');
    }
    return response.data;
  }

  /**
   * Submit survey responses
   */
  async submitSurveyResponse(request: SubmitSurveyRequest): Promise<any> {
    const response = await this.apiClient.post<any>('/api/survey/responses', request);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to submit survey response');
    }
    return response.data;
  }

  /**
   * Create a new survey
   */
  async createSurvey(surveyData: {
    title: string;
    description?: string;
    projectId: string;
    questions: Array<{
      question: string;
      type: typeof QuestionType[keyof typeof QuestionType];
      required: boolean;
      options?: string[];
      maxRating?: number;
      order: number;
    }>;
  }): Promise<SurveyConfig> {
    const response = await this.apiClient.post<SurveyConfig>('/api/survey', surveyData);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create survey');
    }
    return response.data;
  }

  /**
   * Get survey responses for a specific survey
   */
  async getSurveyResponses(surveyId: string, projectId: string): Promise<any[]> {
    const response = await this.apiClient.get<any[]>(`/api/survey/${surveyId}/responses?projectId=${projectId}`);
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch survey responses');
    }
    return response.data;
  }
} 