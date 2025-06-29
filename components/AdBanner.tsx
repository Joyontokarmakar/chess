import React, { useEffect } from 'react';
import { Theme } from '../types';

interface AdBannerProps {
  className?: string;
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  theme: Theme;
}

// Ensure adsbygoogle is declared on the window object for TypeScript
declare global {
  interface Window {
    adsbygoogle?: { [key: string]: unknown }[];
  }
}

const AdBanner: React.FC<AdBannerProps> = ({
  className = '',
  slot,
  format = 'auto',
  responsive = true,
  theme,
}) => {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  // AdSense needs a key to re-render if the ad slot changes, which is good practice.
  // The outer div helps in centering and providing a minimum height to prevent layout shifts.
  const adContainerStyle: React.CSSProperties = {
    minHeight: '90px', // A typical banner height to prevent CLS
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Hide any overflow from the ad unit
  };

  const adLabelColor = theme === 'dark' ? 'text-slate-500' : 'text-slate-400';

  return (
    <div style={adContainerStyle} className={className}>
      <div className="text-center w-full">
        <span className={`text-[0.6rem] ${adLabelColor}`}>Advertisement</span>
        <ins
          key={slot} // Re-render if slot ID changes
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // IMPORTANT: Replace with your Publisher ID
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive={responsive.toString()}
        ></ins>
      </div>
    </div>
  );
};

export default AdBanner;
