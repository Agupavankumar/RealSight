import { createApiClient, type ApiClient, type ApiResponse } from './ApiClient';

export interface AdMetadata {
  id: string;
  projectId: string;
  title: string;
  content: string;
  brandName: string;
  imageUrl?: string;
  clickUrl?: string;
  isActive: boolean;
}

export interface AdService {
  getAdMetadata: (adId: string, projectId: string) => Promise<ApiResponse<AdMetadata>>;
  getAdsByProject: (projectId: string) => Promise<ApiResponse<AdMetadata[]>>;
}

export function createAdService(baseUrl?: string): AdService {
  const apiClient = createApiClient({ baseUrl });
  
  return {
    async getAdMetadata(adId: string, projectId: string): Promise<ApiResponse<AdMetadata>> {
      return apiClient.get<AdMetadata>(`/api/Ads/${adId}?projectId=${projectId}`);
    },

    async getAdsByProject(projectId: string): Promise<ApiResponse<AdMetadata[]>> {
      return apiClient.get<AdMetadata[]>(`/api/Ads/project/${projectId}`);
    },
  };
} 