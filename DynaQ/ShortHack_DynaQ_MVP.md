# 🧠 In-House Ad and Survey SDK

## 🚀 Project Overview

This SDK is designed to be integrated into React-based web applications to:
- Dynamically load and display ads.
- Track user interactions (clicks, hovers, impressions).
- Trigger surveys based on user behavior.
- Send data to a centralized backend for analytics.
- Organize ads and events under project hierarchies for better management and analytics.
- The SDK is modular and reusable across multiple internal projects.

## 🎯 MVP Goals

1. Replace third-party tools like Optimizely for ad delivery and tracking.
2. Integrate survey functionality similar to Qualtrics.
3. Provide a unified SDK for use across all internal React projects.
4. Enable centralized analytics and feedback collection.
5. Implement project-based organization of ads and their associated events.

## 🧩 Detailed Feature Breakdown

### 1. `<AdContainer />`
- **Description**: Renders ads dynamically based on `adId`.
- **Props**:
  - `adId` (string): Unique identifier for the ad to be displayed.
  - `projectId` (string): Project identifier this ad belongs to.
  - `onClick` (function): Callback function for click events.
- **Behavior**:
  - Fetches ad metadata from the backend using project context.
  - Displays the ad content.
  - Tracks impressions and clicks automatically with project attribution.

### 2. `<SurveyPopup />`
- **Description**: Displays a modal survey triggered by user behavior.
- **Props**:
  - `surveyId` (string): Unique identifier for the survey.
  - `projectId` (string): Project identifier this survey belongs to.
  - `visible` (boolean): Controls the visibility of the survey modal.
  - `onClose` (function): Callback function to handle modal close.
- **Behavior**:
  - Fetches survey configuration from the backend with project context.
  - Displays survey questions and collects responses.
  - Submits responses to the backend.

### 3. `useInteractionTracker()`
- **Description**: Custom hook to track user events (clicks, hovers, etc.).
- **API**:
  - `trackEvent(eventType, eventId, projectId)`: Tracks a specific user event within a project context.
- **Behavior**:
  - Sends event data to the backend for analytics.
  - Automatically associates events with their parent ad and project.

### 4. `useSurveyTrigger()`
- **Description**: Hook to determine when to show a survey.
- **API**:
  - `useSurveyTrigger({ trigger, threshold, projectId })`: Returns a boolean indicating whether to show the survey.
- **Behavior**:
  - Evaluates rules like time on page, number of clicks, etc.
  - Determines if the survey should be triggered.

### 5. `<ProjectDashboard />`
- **Description**: Admin interface for managing projects and their assets.
- **Features**:
  - Project creation with automatic ID generation
  - Ad management within projects
  - Event tracking and analytics by project
  - Performance metrics at project and ad levels

## 🔌 Backend API Expectations

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/projects` | GET | List all projects |
| `/projects` | POST | Create a new project |
| `/projects/{projectId}/ads` | GET | List ads for a project |
| `/projects/{projectId}/ads` | POST | Create a new ad under a project |
| `/projects/{projectId}/ads/{adId}/events` | GET | Get events for a specific ad |
| `/projects/{projectId}/events` | GET | Get all events for a project |
| `/track` | POST | Log user interaction (requires projectId and adId) |
| `/survey` | GET | Fetch survey config |
| `/survey/response` | POST | Submit survey response |
| `/analytics/projects/{projectId}` | GET | Get analytics for a specific project |

## 🏗️ MVP Architecture Overview

### Frontend SDK
- React-based components and hooks.
- Distributed as a private NPM package.
- **Project Context Provider**:
  - Wraps application to provide project context to all components
  - Automatically injects project ID into all tracking events

### Backend Services (in .NET)
- **ProjectService**: Manages project creation and configuration.
- **AdService**: Serves ads based on rules and project context.
- **TrackingService**: Logs user interactions with project and ad attribution.
- **SurveyService**: Manages survey logic and responses.
- **AnalyticsService**: Aggregates and exposes metrics by project.

### Database
- SQL Server for structured data with project-centric schema.
- Redis for caching.

## 🗄️ Database Schema

The following schema is designed for SQL Server and optimized for project-centric queries and analytics.

**Tables:**

- **projects**:  
  - `id` (UUID, PK)  
  - `name` (string)  
  - `description` (text)  
  - `created_at` (timestamp)  
  - `updated_at` (timestamp)

- **ads**:  
  - `id` (UUID, PK)  
  - `project_id` (UUID, FK → projects.id)  
  - `name` (string)  
  - `content_url` (string)  
  - `metadata` (JSONB)  
  - `created_at` (timestamp)  
  - `updated_at` (timestamp)

- **surveys**:  
  - `id` (UUID, PK)  
  - `project_id` (UUID, FK → projects.id)  
  - `name` (string)  
  - `config` (JSONB)  
  - `created_at` (timestamp)  
  - `updated_at` (timestamp)

- **events**:  
  - `id` (UUID, PK)  
  - `project_id` (UUID, FK → projects.id)  
  - `ad_id` (UUID, FK → ads.id, nullable)  
  - `event_type` (string)  
  - `user_id` (string or UUID, nullable)  
  - `metadata` (JSONB)  
  - `created_at` (timestamp)

- **survey_responses**:  
  - `id` (UUID, PK)  
  - `survey_id` (UUID, FK → surveys.id)  
  - `project_id` (UUID, FK → projects.id)  
  - `user_id` (string or UUID, nullable)  
  - `responses` (JSONB)  
  - `created_at` (timestamp)

**Relationships:**
- A project has many ads, surveys, events, and survey_responses.
- An ad belongs to a project and has many events.
- A survey belongs to a project and has many survey_responses.
- An event always belongs to a project, and optionally to an ad.
- A survey_response always belongs to a survey and a project.

## 🛠️ Development Milestones

### Milestone 1: Basic SDK Setup
- Initialize the project with TypeScript and React.
- Set up the folder structure.
- Implement `<AdContainer />` component with project context.
- Implement `useInteractionTracker()` hook with project and ad attribution.

### Milestone 2: Survey Integration
- Implement `<SurveyPopup />` component.
- Implement `useSurveyTrigger()` hook.
- Set up backend endpoints for survey management.

### Milestone 3: Project Management
- Develop project data model and database schema.
- Create ProjectService for CRUD operations.
- Implement project dashboard UI for project creation and management.
- Add unique project ID generation system.
- Build relationships between projects, ads, and events.

### Milestone 4: Backend Services
- Develop AdService to serve ads based on project context.
- Develop TrackingService to log interactions with project/ad attribution.
- Develop SurveyService to manage surveys.
- Set up SQL Server and Redis databases with proper relationships.
- Implement analytics aggregation by project.

### Milestone 5: Testing and Documentation
- Write unit tests for SDK components and hooks.
- Document the SDK usage and API expectations.
- Create project setup and integration guides.
- Publish the SDK as a private NPM package.

## 🤖 AI Agent Notes

- This SDK is intended to be generated as a modular React library.
- Backend should be scaffolded in .NET Core with RESTful APIs.
- Frontend SDK should be published as a private NPM package.
- Ensure CI/CD pipelines for both SDK and backend services.
- All events must be tied to both an ad and a project for proper attribution.
- Database schema should optimize for querying events by project ID.