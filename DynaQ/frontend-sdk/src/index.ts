// Main SDK entry point - exports all public APIs

// Import CSS for styling - this ensures styles are included in the build
import './components/AdContainer.css';

// Components
export { AdContainer } from './components';

// Hooks
export { useInteractionTracker, useAdData } from './hooks';

// Context
export { ProjectProvider, useProject } from './context';

// API Services
export { 
  initializeApiClient, 
  getAdService, 
  getTrackingService,
  createApiClient,
  createAdService,
  createTrackingService
} from './api';

// Types
export type { 
  ApiResponse, 
  ApiClient, 
  ApiClientConfig 
} from './api/ApiClient';
export type { AdMetadata, AdService } from './api/AdService';
export type { TrackingEventRequest, TrackingEventResponse, TrackingService } from './api/TrackingService'; 