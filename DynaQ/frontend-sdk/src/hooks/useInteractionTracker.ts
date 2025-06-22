import { useCallback } from 'react';
import { useProject } from '../context';
import { getTrackingService } from '../api';

type EventType = 'ad_impression' | 'ad_click' | 'survey_impression' | 'survey_submit';

interface EventData {
  eventId: string;
  [key: string]: any; // For additional metadata
}

export const useInteractionTracker = () => {
  const { projectId: contextProjectId } = useProject();

  const trackEvent = useCallback(
    async (eventType: EventType, eventData: EventData, projectId?: string) => {
      const finalProjectId = projectId || contextProjectId;

      if (!finalProjectId) {
        console.error('DynaQ SDK Error: Project ID is not set. Cannot track event.');
        return;
      }

      try {
        const trackingService = getTrackingService();
        const payload = {
          eventType,
          eventId: eventData.eventId,
          projectId: finalProjectId,
          adId: eventData.adId,
          surveyId: eventData.surveyId,
          metadata: eventData,
          sessionId: eventData.sessionId || generateSessionId(),
        };

        const response = await trackingService.trackEvent(payload);
        
        if (response.success) {
          console.log('Event tracked successfully:', payload);
        } else {
          console.error('Failed to track event:', response.error);
        }
      } catch (error) {
        console.error('Error tracking event:', error);
        // Fallback to console logging if API fails
        console.log('Tracking Event (fallback):', {
          ...eventData,
          eventType,
          projectId: finalProjectId,
          timestamp: new Date().toISOString(),
        });
      }
    },
    [contextProjectId]
  );

  return { trackEvent };
};

// Generate a simple session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
} 