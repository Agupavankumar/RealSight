import React from 'react';
import { useInteractionTracker } from '../hooks';
import './AdContainer.css';

interface AdContainerProps {
  adId: string;
  headline: string;
  subheadline: string;
  brandName: string;
  buttonText: string;
  imageUrl: string;
  advertiserDisclosureText: string;
  advertiserDisclosureLink: string;
  onButtonClick?: (adId: string) => void;
}

export const AdContainer: React.FC<AdContainerProps> = ({
  adId,
  headline,
  subheadline,
  brandName,
  buttonText,
  imageUrl,
  advertiserDisclosureText,
  advertiserDisclosureLink,
  onButtonClick,
}) => {
  const { trackEvent } = useInteractionTracker();

  const handleButtonClick = () => {
    trackEvent('ad_click', { eventId: adId, adId: adId });
    if (onButtonClick) {
      onButtonClick(adId);
    }
  };

  const containerStyle = {
    backgroundImage: `url(${imageUrl})`,
  };

  // TODO: Track impression event when the component becomes visible.

  return (
    <div className="ad-container" style={containerStyle}>
      <div className="ad-content">
        <div className="ad-text-section">
          <h1>{headline}</h1>
          <p>{subheadline}</p>
          <button onClick={handleButtonClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M11 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h6zM5 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H5z"/>
              <path d="M8 14a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
            </svg>
            {buttonText}
          </button>
        </div>
      </div>
      <div className="ad-bottom-row">
        <span className="ad-brand">{brandName}</span>
        <div className="ad-footer">
          <a href={advertiserDisclosureLink} target="_blank" rel="noopener noreferrer">
            {advertiserDisclosureText}
          </a>
        </div>
      </div>
    </div>
  );
}; 