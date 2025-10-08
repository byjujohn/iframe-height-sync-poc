import React, { useEffect, useRef, useState } from 'react';

const VendorPortal = ({ iframeUrl, onSizeChange }) => {
  const iframeRef = useRef(null);
  const [currentHeight, setCurrentHeight] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🎯 VendorPortal mounted with URL:', iframeUrl);

    // Listen for postMessage from iframe content
    const handleMessage = (event) => {
      // In production, validate event.origin for security
      // For this POC, we'll accept messages from same origin
      if (event.data && event.data.type === 'IFRAME_HEIGHT_UPDATE') {
        const height = event.data.height;
        console.log('📨 Received height from iframe:', height);

        setCurrentHeight(height);
        setIsLoading(false);

        // Call the parent callback
        if (onSizeChange && typeof onSizeChange === 'function') {
          onSizeChange(height);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onSizeChange]);

  useEffect(() => {
    // When iframe URL changes, reset loading state
    setIsLoading(true);
  }, [iframeUrl]);

  const handleIframeLoad = () => {
    console.log('🔄 Iframe loaded');
    // The iframe content will send its height via postMessage
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '5px',
        marginBottom: '10px',
        fontSize: '14px',
        color: '#555'
      }}>
        <strong>🔧 React Component Status:</strong>
        {isLoading ? (
          <span style={{ color: '#ff9800', marginLeft: '10px' }}>⏳ Loading...</span>
        ) : (
          <span style={{ color: '#4caf50', marginLeft: '10px' }}>
            ✅ Synced (Height: {currentHeight}px)
          </span>
        )}
      </div>

      <iframe
        ref={iframeRef}
        src={iframeUrl || './iframe-content/page1.html'}
        onLoad={handleIframeLoad}
        style={{
          width: '100%',
          height: currentHeight > 0 ? `${currentHeight}px` : '600px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          transition: 'height 0.3s ease',
          overflow: 'hidden'
        }}
        title="Vendor Portal Content"
      />
    </div>
  );
};

export default VendorPortal;