import React from 'react';
import ReactDOM from 'react-dom/client';
import r2wc from 'react-to-webcomponent';
import VendorPortal from './VendorPortal.jsx';

// Convert React component to Web Component
const VendorPortalWebComponent = r2wc(VendorPortal, React, ReactDOM, {
    props: {
        iframeUrl: 'string',
        onSizeChange: 'function'
    }
});

// Define the custom element
customElements.define('vendor-portal', VendorPortalWebComponent);

console.log('✅ vendor-portal web component registered');