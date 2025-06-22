import { createApiClient, createDefaultApiClient, type ApiClient, type ApiClientConfig } from './ApiClient';
import { createAdService, type AdService } from './AdService';
import { createTrackingService, type TrackingService } from './TrackingService';

// Default configuration
const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: 'http://localhost:5008',
  timeout: 10000,
};

// Global API client instance
let globalApiClient: ApiClient | null = null;

// Service instances
let adService: AdService | null = null;
let trackingService: TrackingService | null = null;

/**
 * Initialize the API client with configuration
 */
export function initializeApiClient(config: Partial<ApiClientConfig> = {}): void {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  globalApiClient = createApiClient(finalConfig);
  
  // Reset service instances
  adService = null;
  trackingService = null;
}

/**
 * Get the global API client instance
 */
export function getApiClient(): ApiClient {
  if (!globalApiClient) {
    globalApiClient = createDefaultApiClient();
  }
  return globalApiClient;
}

/**
 * Get the AdService instance
 */
export function getAdService(): AdService {
  if (!adService) {
    adService = createAdService(DEFAULT_CONFIG.baseUrl);
  }
  return adService;
}

/**
 * Get the TrackingService instance
 */
export function getTrackingService(): TrackingService {
  if (!trackingService) {
    trackingService = createTrackingService(DEFAULT_CONFIG.baseUrl);
  }
  return trackingService;
}

// Export the factory functions and types for advanced usage
export { 
  createApiClient, 
  createDefaultApiClient, 
  createAdService, 
  createTrackingService 
};
export type { 
  ApiResponse, 
  ApiClient, 
  ApiClientConfig 
} from './ApiClient';
export type { AdMetadata, AdService } from './AdService';
export type { TrackingEventRequest, TrackingEventResponse, TrackingService } from './TrackingService'; 