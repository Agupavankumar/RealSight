import React, { useState, useEffect } from 'react';
import { useInteractionTracker, useAdData } from '../hooks';
import fallbackImage from '../assets/ad-image.webp';
import './AdContainer.css';

interface AdContainerProps {
  adId: string;
  onButtonClick?: (adId: string) => void;
}

export const AdContainer: React.FC<AdContainerProps> = ({
  adId,
  onButtonClick,
}) => {
  const { trackEvent } = useInteractionTracker();
  const { adData, loading, error } = useAdData(adId);
  const [imageError, setImageError] = useState(false);
  const [impressionTracked, setImpressionTracked] = useState(false);

  // Track ad impression when ad loads successfully
  useEffect(() => {
    if (adData && !loading && !error && !impressionTracked) {
      trackEvent('ad_impression', { 
        eventId: `${adId}_impression_${Date.now()}`,
        adId: adId 
      });
      setImpressionTracked(true);
    }
  }, [adData, loading, error, impressionTracked, adId, trackEvent]);

  const handleButtonClick = () => {
    if (adData) {
      trackEvent('ad_click', { 
        eventId: `${adId}_click_${Date.now()}`,
        adId: adId 
      });
      if (onButtonClick) {
        onButtonClick(adId);
      }
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="ad-container loading">
        <div className="ad-content">
          <div className="ad-text-section">
            <div className="loading-skeleton">
              <div className="skeleton-title"></div>
              <div className="skeleton-content"></div>
              <div className="skeleton-button"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !adData) {
    return (
      <div className="ad-container error">
        <div className="ad-content">
          <div className="ad-text-section">
            <p className="error-message">
              {error || 'Failed to load ad content'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Determine which image to use
  const backgroundImage = imageError || !adData.imageUrl ? fallbackImage : adData.imageUrl;
  
  const containerStyle = {
    backgroundImage: `url(${backgroundImage})`,
  };

  return (
    <div className="ad-container" style={containerStyle}>
      {/* Hidden image element to detect loading errors */}
      {adData.imageUrl && (
        <img 
          src={adData.imageUrl} 
          alt="" 
          style={{ display: 'none' }}
          onError={handleImageError}
        />
      )}
      <div className="ad-content">
        <div className="ad-text-section">
          <h1>{adData.title}</h1>
          <p>{adData.content}</p>
          <button onClick={handleButtonClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            Learn More
          </button>
        </div>
      </div>
      <div className="ad-bottom-row">
        <span className="ad-brand">{adData.brandName}</span>
        <div className="ad-footer">
          <a href={adData.clickUrl} target="_blank" rel="noopener noreferrer">
            Advertiser Disclosure
          </a>
        </div>
      </div>
    </div>
  );
}; 