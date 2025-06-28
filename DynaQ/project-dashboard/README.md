# DynaQ Project Dashboard

This is the analytics dashboard for the DynaQ project, providing insights and metrics for ads and surveys.

## Features

### Overview Tab
- **Total Events**: Shows the total number of tracking events
- **Distinct Users**: Count of unique users based on session IDs
- **Ad Clicks**: Total number of ad click events
- **Survey Submissions**: Total number of survey submission events
- **Events Over Time**: Line chart showing event trends
- **Event Distribution**: Pie chart showing the breakdown of different event types

### Ads Analytics Tab
- **Ad Impressions**: Total number of ad impressions
- **Ad Clicks**: Total number of ad clicks
- **Click Rate**: Percentage of impressions that resulted in clicks
- **Top Performing Ads**: Bar chart showing ads with the most clicks

### Surveys Analytics Tab
- **Survey Impressions**: Total number of survey views
- **Survey Submissions**: Total number of survey completions
- **Completion Rate**: Percentage of survey views that resulted in submissions
- **Survey Performance**: Detailed analytics for survey interactions

## Getting Started

### Prerequisites
- Node.js 14 or higher
- DynaQ Backend running on `http://localhost:5000`

### Installation
```bash
npm install
```

### Development
```bash
npm start
```

This will start the development server on `http://localhost:3000`.

### Build for Production
```bash
npm run build
```

## API Integration

**Currently using mock data for UI development.** The dashboard is configured to show sample analytics data without requiring the backend. 

When ready to integrate with the backend:
1. Set `USE_MOCK_DATA = false` in `src/services/apiService.ts`
2. Make sure the DynaQ Backend API is running at `http://localhost:5000/api`

### Tracked Events
The dashboard analyzes the following event types:
- `ad_impression`: When an ad is displayed
- `ad_click`: When a user clicks on an ad (tracked from AdContainer component)
- `survey_impression`: When a survey is displayed
- `survey_submit`: When a user submits a survey

### Date Range Filtering
You can filter analytics data by:
- Last 7 days
- Last 30 days
- Last 90 days

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard component
│   └── Dashboard.css      # Dashboard styling
├── services/
│   └── apiService.ts      # API service for backend communication
├── App.tsx                # Main app component
└── App.css                # App styling
```

## Integration with AdContainer

The dashboard automatically tracks clicks from the `AdContainer` component in the frontend-sdk. When users click the "Learn More" button in an ad, it triggers an `ad_click` event that appears in this dashboard with distinct count analytics.

## Customization

To change the project ID or API endpoint, modify the configuration in:
- `src/services/apiService.ts` - Update `API_BASE_URL`
- `src/App.tsx` - Update the `projectId` prop passed to Dashboard

## Technology Stack

- **React 18** with TypeScript
- **Recharts** for data visualization
- **Axios** for API calls
- **Lucide React** for icons
- **CSS3** with modern styling
