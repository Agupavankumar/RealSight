import { useState, useEffect } from 'react';
import { useProject } from '../context';
import { getAdService } from '../api';
import type { AdMetadata } from '../api';

interface UseAdDataResult {
  adData: AdMetadata | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAdData = (adId: string): UseAdDataResult => {
  const { projectId } = useProject();
  const [adData, setAdData] = useState<AdMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdData = async () => {
    if (!projectId) {
      setError('Project ID is not set');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const adService = getAdService();
      const response = await adService.getAdMetadata(adId, projectId);
      
      if (response.success && response.data) {
        setAdData(response.data);
      } else {
        setError(response.error || 'Failed to fetch ad data');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdData();
  }, [adId, projectId]);

  const refetch = () => {
    fetchAdData();
  };

  return { adData, loading, error, refetch };
}; 