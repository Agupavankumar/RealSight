import { 
  createApiClient, 
  createAdService, 
  createTrackingService,
  getAdService,
  getTrackingService,
  initializeApiClient
} from '../api';

// Example 1: Direct usage with factory functions
async function directUsageExample() {
  // Create API client directly
  const apiClient = createApiClient({
    baseUrl: 'https://api.dynaq.com',
    timeout: 15000
  });

  // Create services directly
  const adService = createAdService('https://api.dynaq.com');
  const trackingService = createTrackingService('https://api.dynaq.com');

  try {
    // Use the API client directly
    const response = await apiClient.get('/api/health');
    console.log('Health check:', response);

    // Use the services
    const adResponse = await adService.getAdMetadata('ad-001', 'project-001');
    if (adResponse.success) {
      console.log('Ad data:', adResponse.data);
    }

    const trackingResponse = await trackingService.trackEvent({
      eventType: 'ad_click',
      eventId: 'click-123',
      projectId: 'project-001',
      adId: 'ad-001'
    });

    if (trackingResponse.success) {
      console.log('Event tracked:', trackingResponse.data);
    }

  } catch (error) {
    console.error('API usage error:', error);
  }
}

// Example 2: Using the global service factory
async function globalServiceExample() {
  // Initialize with custom config
  initializeApiClient({
    baseUrl: 'https://api.dynaq.com',
    timeout: 15000
  });

  // Get services from the global factory
  const adService = getAdService();
  const trackingService = getTrackingService();

  try {
    // Use the services
    const adResponse = await adService.getAdMetadata('ad-001', 'project-001');
    if (adResponse.success) {
      console.log('Ad data:', adResponse.data);
    }

    const eventsResponse = await trackingService.getEventsByProject('project-001');
    if (eventsResponse.success) {
      console.log('Project events:', eventsResponse.data);
    }

  } catch (error) {
    console.error('API usage error:', error);
  }
}

// Example 3: Multiple clients with different configurations
async function multipleClientsExample() {
  // Create different clients for different environments
  const productionClient = createApiClient({
    baseUrl: 'https://api.dynaq.com',
    timeout: 20000
  });

  const stagingClient = createApiClient({
    baseUrl: 'https://staging-api.dynaq.com',
    timeout: 10000
  });

  const localClient = createApiClient({
    baseUrl: 'http://localhost:5008',
    timeout: 5000
  });

  // Use different clients for different purposes
  try {
    const prodHealth = await productionClient.get('/api/health');
    const stagingHealth = await stagingClient.get('/api/health');
    const localHealth = await localClient.get('/api/health');

    console.log('Production health:', prodHealth);
    console.log('Staging health:', stagingHealth);
    console.log('Local health:', localHealth);

  } catch (error) {
    console.error('Health check error:', error);
  }
}

// Example 4: Service composition
function createProjectService(baseUrl: string) {
  const adService = createAdService(baseUrl);
  const trackingService = createTrackingService(baseUrl);

  return {
    // Get ad with tracking
    async getAdWithTracking(adId: string, projectId: string) {
      const adResponse = await adService.getAdMetadata(adId, projectId);
      
      if (adResponse.success) {
        // Track the ad view
        await trackingService.trackEvent({
          eventType: 'ad_impression',
          eventId: `impression-${Date.now()}`,
          projectId,
          adId
        });
      }

      return adResponse;
    },

    // Get project analytics
    async getProjectAnalytics(projectId: string) {
      const [adsResponse, eventsResponse] = await Promise.all([
        adService.getAdsByProject(projectId),
        trackingService.getEventsByProject(projectId)
      ]);

      return {
        ads: adsResponse.success ? adsResponse.data : [],
        events: eventsResponse.success ? eventsResponse.data : []
      };
    }
  };
}

export { 
  directUsageExample, 
  globalServiceExample, 
  multipleClientsExample, 
  createProjectService 
}; 