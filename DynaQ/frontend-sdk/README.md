# DynaQ SDK

A React SDK for displaying ads and tracking user interactions in React applications.

## Features

- 🎯 **Ad Display**: Render ads with automatic metadata fetching
- 📊 **Event Tracking**: Track user interactions and impressions
- 🔧 **Project Context**: Manage project-specific configurations
- 🎨 **Customizable**: Fully customizable ad components
- 📱 **Responsive**: Mobile-friendly ad containers
- 🔒 **Type Safe**: Full TypeScript support

## Installation

```bash
npm install @realsight/dynaq-sdk
```

## CSS Import (Required)

To ensure the AdContainer and other SDK components are styled correctly, **import the CSS file in your app's entry point (e.g., `main.tsx` or `App.tsx`)**:

```tsx
import '@realsight/dynaq-sdk/dist/dynaq-sdk.css';
```

## Quick Start

### 1. Set up the Project Provider

Wrap your app with the `ProjectProvider` to provide project context:

```tsx
import { ProjectProvider } from '@realsight/dynaq-sdk';

function App() {
  return (
    <ProjectProvider initialProjectId="your-project-id">
      <YourApp />
    </ProjectProvider>
  );
}
```

### 2. Display an Ad

Use the `AdContainer` component to display ads:

```tsx
import { AdContainer } from '@realsight/dynaq-sdk';

function MyComponent() {
  const handleAdClick = (adId: string) => {
    console.log('Ad clicked:', adId);
    // Handle ad click (e.g., navigate to advertiser page)
  };

  return (
    <AdContainer 
      adId="ad-123" 
      onButtonClick={handleAdClick}
    />
  );
}
```

### 3. Track Custom Events

Use the `useInteractionTracker` hook to track custom events:

```tsx
import { useInteractionTracker } from '@realsight/dynaq-sdk';

function MyComponent() {
  const { trackEvent } = useInteractionTracker();

  const handleButtonClick = () => {
    trackEvent('custom_event', {
      eventId: 'button-click',
      buttonType: 'cta',
      page: 'homepage'
    });
  };

  return (
    <button onClick={handleButtonClick}>
      Click Me
    </button>
  );
}
```

## API Reference

### Components

#### `AdContainer`

Displays an ad with automatic metadata fetching and interaction tracking.

**Props:**
- `adId` (string, required): The ID of the ad to display
- `onButtonClick?` (function): Callback when the ad's CTA button is clicked

**Example:**
```tsx
<AdContainer 
  adId="ad-123" 
  onButtonClick={(adId) => console.log('Ad clicked:', adId)}
/>
```

### Hooks

#### `useInteractionTracker()`

Returns a `trackEvent` function for tracking user interactions.

**Returns:**
- `trackEvent(eventType, eventData, projectId?)`: Function to track events

**Event Types:**
- `'ad_impression'`: When an ad is viewed
- `'ad_click'`: When an ad is clicked
- `'survey_impression'`: When a survey is shown (future)
- `'survey_submit'`: When a survey is submitted (future)

**Example:**
```tsx
const { trackEvent } = useInteractionTracker();

trackEvent('ad_click', {
  eventId: 'ad-123-click',
  adId: 'ad-123',
  position: 'sidebar'
});
```

#### `useAdData(adId)`

Fetches and manages ad metadata.

**Returns:**
- `adData`: The ad metadata or null
- `loading`: Boolean indicating if data is being fetched
- `error`: Error message if fetch failed
- `refetch`: Function to refetch the data

**Example:**
```tsx
const { adData, loading, error, refetch } = useAdData('ad-123');

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (adData) return <div>{adData.title}</div>;
```

### Context

#### `ProjectProvider`

Provides project context to all child components.

**Props:**
- `children` (ReactNode, required): Child components
- `initialProjectId?` (string): Initial project ID

#### `useProject()`

Hook to access project context.

**Returns:**
- `projectId`: Current project ID
- `setProjectId`: Function to update project ID

### API Services

#### `initializeApiClient(config)`

Initialize the API client with custom configuration.

**Config Options:**
- `baseUrl` (string): API base URL (default: 'http://localhost:5008')
- `timeout` (number): Request timeout in ms (default: 10000)

**Example:**
```tsx
import { initializeApiClient } from '@realsight/dynaq-sdk';

initializeApiClient({
  baseUrl: 'https://api.yourdomain.com',
  timeout: 15000
});
```

## Configuration

### API Configuration

The SDK connects to your backend API. Configure the API client:

```tsx
import { initializeApiClient } from '@realsight/dynaq-sdk';

// Initialize with your API configuration
initializeApiClient({
  baseUrl: 'https://your-api-domain.com',
  timeout: 10000
});
```

### Project Setup

Each project needs a unique project ID. Set this in your `ProjectProvider`:

```tsx
<ProjectProvider initialProjectId="your-unique-project-id">
  <YourApp />
</ProjectProvider>
```

## Development

### Building the SDK

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For support and questions, please contact the RealSight team.
