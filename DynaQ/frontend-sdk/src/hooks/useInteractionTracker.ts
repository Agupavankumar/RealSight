import { useCallback } from 'react';
import { useProject } from '../context';

type EventType = 'ad_impression' | 'ad_click' | 'survey_impression' | 'survey_submit';

interface EventData {
  eventId: string;
  [key: string]: any; // For additional metadata
}

export const useInteractionTracker = () => {
  const { projectId: contextProjectId } = useProject();

  const trackEvent = useCallback(
    (eventType: EventType, eventData: EventData, projectId?: string) => {
      const finalProjectId = projectId || contextProjectId;

      if (!finalProjectId) {
        console.error('DynaQ SDK Error: Project ID is not set. Cannot track event.');
        return;
      }

      const payload = {
        ...eventData,
        eventType,
        projectId: finalProjectId,
        timestamp: new Date().toISOString(),
      };

      // TODO: Replace with actual API call to the backend
      console.log('Tracking Event:', payload);

      // Example of a future API call:
      // fetch('/api/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });
    },
    [contextProjectId]
  );

  return { trackEvent };
}; 