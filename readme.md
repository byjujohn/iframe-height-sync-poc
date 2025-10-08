# Iframe Height Synchronization POC

A proof of concept demonstrating cross-origin iframe height synchronization between a vanilla JavaScript parent application and a React-based web component.

## 🏗️ Project Structure

```
/project
├── index.html                          # Parent application (vanilla JS)
├── package.json                        # Dependencies and build scripts
├── webpack.config.js                   # Webpack configuration
├── /vendor-component
│   ├── VendorPortal.jsx               # React component
│   ├── index.js                       # Web component conversion
│   └── /dist
│       └── bundle.js                  # Built output (generated)
└── /iframe-content
    ├── page1.html                     # Short page (~300px)
    ├── page2.html                     # Medium page (~800px)
    └── page3.html                     # Tall page (~1500px)
```

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation Steps

1. **Create the project structure:**

```bash
mkdir iframe-height-sync-poc
cd iframe-height-sync-poc
mkdir vendor-component iframe-content
```

2. **Create all the files** as provided in the artifacts above:

   - `index.html` (root)
   - `package.json` (root)
   - `webpack.config.js` (root)
   - `vendor-component/VendorPortal.jsx`
   - `vendor-component/index.js`
   - `iframe-content/page1.html`
   - `iframe-content/page2.html`
   - `iframe-content/page3.html`

3. **Install dependencies:**

```bash
npm install
```

4. **Build the vendor component:**

```bash
npm run build
```

This will create the `vendor-component/dist/bundle.js` file.

5. **Serve the application:**

You need to serve the files via a local web server (not file://). Choose one of these options:

**Option A: Using Python (if installed):**

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

**Option B: Using Node.js http-server:**

```bash
npx http-server -p 8000
```

**Option C: Using VS Code Live Server:**

- Install the "Live Server" extension
- Right-click on `index.html` and select "Open with Live Server"

6. **Open in browser:**

```
http://localhost:8000/index.html
```

## 🔍 How It Works

### Height Detection Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Iframe Content (page1.html)              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ ResizeObserver monitors document.body.scrollHeight │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ window.parent.postMessage({                        │    │
│  │   type: 'IFRAME_HEIGHT_UPDATE',                    │    │
│  │   height: scrollHeight                             │    │
│  │ }, '*')                                            │    │
│  └────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ postMessage
                          │
┌─────────────────────────▼────────────────────────────────────┐
│              React Component (VendorPortal.jsx)              │
│  ┌────────────────────────────────────────────────────┐    │
│  │ window.addEventListener('message', handler)        │    │
│  └────────────────────┬───────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ setState(height)                                   │    │
│  │ onSizeChange(height) // Call parent callback      │    │
│  └────────────────────┬───────────────────────────────┘    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ Function callback
                          │
┌─────────────────────────▼────────────────────────────────────┐
│           Parent Application (index.html)                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │ vendorPortal.onSizeChange = (height) => {         │    │
│  │   wrapper.style.height = `${height + 40}px`;     │    │
│  │ }                                                  │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

### Key Components

1. **Iframe Content Script (pages 1-3):**

   - Uses `ResizeObserver` to monitor height changes
   - Sends `scrollHeight` via `postMessage` to parent
   - Triggers on: load, resize, and with a fallback timeout

2. **React Component (VendorPortal.jsx):**

   - Listens for `message` events
   - Filters for `IFRAME_HEIGHT_UPDATE` type
   - Updates iframe height via state
   - Calls `onSizeChange` callback prop

3. **Web Component Bridge (index.js):**

   - Uses `react-to-webcomponent` to wrap React component
   - Exposes `iframeUrl` and `onSizeChange` as web component props
   - Registers as `<vendor-portal>` custom element

4. **Parent Application (index.html):**
   - Vanilla JavaScript that uses the web component
   - Sets the `onSizeChange` callback
   - Adjusts wrapper div height based on callback data
   - Displays debug information

## 🧪 Testing the Application

1. **Initial Load:** Page 1 loads automatically and height syncs
2. **Navigate:** Click "Page 2 (Medium)" - observe smooth height transition
3. **Navigate:** Click "Page 3 (Tall)" - observe larger height adjustment
4. **Debug Panel:** Watch the metrics update in real-time
5. **Console Logs:** Open DevTools to see detailed communication logs

### Expected Console Output:

```
✅ vendor-portal web component registered
✅ vendor-portal web component is defined
✅ Parent application initialized
🎯 VendorPortal mounted with URL: ./iframe-content/page1.html
🌐 Page 1 loaded
📤 Page 1 sending height: 350
📨 Received height from iframe: 350
📏 Parent received height update: 350
```

## 🔒 Production Considerations

### Security Enhancements

1. **Origin Validation:**

```javascript
window.addEventListener("message", (event) => {
  // Validate the origin
  if (event.origin !== "https://trusted-domain.com") {
    return;
  }
  // Process message
});
```

2. **Specific postMessage Target:**

```javascript
window.parent.postMessage(data, "https://parent-domain.com");
```

### Performance Optimizations

1. **Debounce Height Updates:**

```javascript
let timeout;
function sendHeight() {
  clearTimeout(timeout);
  timeout = setTimeout(() => {
    const height = document.body.scrollHeight;
    window.parent.postMessage({ type: "IFRAME_HEIGHT_UPDATE", height }, "*");
  }, 100);
}
```

2. **Height Change Threshold:**

```javascript
let lastHeight = 0;
function sendHeight() {
  const height = document.body.scrollHeight;
  if (Math.abs(height - lastHeight) > 10) {
    // Only update if change > 10px
    lastHeight = height;
    window.parent.postMessage({ type: "IFRAME_HEIGHT_UPDATE", height }, "*");
  }
}
```

## 📝 Development Commands

- **Development mode with watch:**

  ```bash
  npm run dev
  ```

  (Watches for changes and rebuilds automatically)

- **Production build:**
  ```bash
  npm run build
  ```

## 🐛 Troubleshooting

### Issue: "vendor-portal is not defined"

**Solution:** Ensure you've run `npm run build` and the bundle.js file exists

### Issue: "No height updates"

**Solution:** Check that you're serving via HTTP (not file://), check browser console for errors

### Issue: "CORS errors"

**Solution:** This POC assumes same-origin. For cross-origin, you need proper CORS headers on the iframe content server

### Issue: "Iframe shows scrollbar"

**Solution:** Check that the iframe height style is being applied correctly, verify postMessage is working

## 🎯 Next Steps for Production

1. Add TypeScript for type safety
2. Implement proper error boundaries
3. Add unit and integration tests
4. Implement retry logic for failed postMessages
5. Add loading states and error handling UI
6. Optimize for performance with debouncing
7. Add comprehensive logging and monitoring
8. Implement proper CSP (Content Security Policy)

## 📄 License

MIT - Free to use for any purpose
