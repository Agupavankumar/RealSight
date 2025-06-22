# 📋 DynaQ Project Task Plan

This project consists of **two separate React projects**:

1. **Frontend SDK (React Library):**
   - A reusable SDK/library to be integrated into internal React applications.
   - Provides components (`<AdContainer />`, `<SurveyPopup />`), hooks (`useInteractionTracker`, `useSurveyTrigger`), and a Project Context Provider.
   - Distributed as a private NPM package for use by other teams.

2. **Admin Dashboard (React App):**
   - A standalone web application for internal admin users.
   - Used to manage projects, ads, surveys, and view analytics/metrics.
   - Includes project creation, asset management, and settings (API key, etc.).

This plan breaks down the work required to accomplish the In-House Ad and Survey SDK project, based on the requirements and milestones in the MVP document.

---

## Milestone 1: Basic SDK Setup
- [ ] Initialize monorepo or main project with TypeScript and React.
- [ ] Set up folder structure for SDK components, hooks, and context providers.
- [ ] Implement Project Context Provider to inject project ID into all components/events.
- [ ] Develop `<AdContainer />` React component:
  - [ ] Accepts `adId`, `projectId`, and `onClick` props.
  - [ ] Fetches ad metadata from backend.
  - [ ] Renders ad content.
  - [ ] Tracks impressions and clicks with project attribution.
- [ ] Implement `useInteractionTracker()` custom hook:
  - [ ] API: `trackEvent(eventType, eventId, projectId)`
  - [ ] Sends event data to backend with project/ad context.
- [ ] Set up initial unit tests for components and hooks.

### Frontend-Backend Integration
- [ ] Define API contracts for ad metadata and event tracking (request/response, error handling).
- [ ] Implement API client module in SDK to communicate with backend endpoints.
- [ ] Integrate `<AdContainer />` and `useInteractionTracker()` with backend APIs.
- [ ] Handle loading, error, and success states in SDK components.
- [ ] Mock backend endpoints for frontend development/testing.
- [ ] Add integration tests for frontend-backend flows.

---

## Milestone 2: Survey Integration
- [ ] Implement `<SurveyPopup />` React component:
  - [ ] Accepts `surveyId`, `projectId`, `visible`, and `onClose` props.
  - [ ] Fetches survey config from backend.
  - [ ] Renders survey questions and collects responses.
  - [ ] Submits responses to backend.
- [ ] Implement `useSurveyTrigger()` custom hook:
  - [ ] API: `useSurveyTrigger({ trigger, threshold, projectId })`
  - [ ] Evaluates rules to trigger survey on button click event.
- [ ] Set up backend endpoints for survey config and response.
- [ ] Add unit tests for survey components and hooks.

### Frontend-Backend Integration
- [ ] Define API contracts for survey config and response submission.
- [ ] Implement API client module for survey-related endpoints in SDK.
- [ ] Integrate `<SurveyPopup />` and `useSurveyTrigger()` with backend APIs.
- [ ] Handle loading, error, and success states in survey components.
- [ ] Mock backend endpoints for survey flows during frontend development/testing.
- [ ] Add integration tests for survey frontend-backend flows.

---

## Milestone 3: Project Management
- [ ] Design and implement project data model and database schema in SQL Server:
  - [ ] Projects table with fields: id, name, apiKey, createdAt, updatedAt
  - [ ] Ads table with projectId foreign key
  - [ ] Surveys table with projectId foreign key
  - [ ] Metrics table with projectId foreign key

- [ ] Create ProjectService for CRUD operations:
  - [ ] Create project with auto-generated API key
  - [ ] List all projects
  - [ ] Get project details by ID
  - [ ] Update project details
  - [ ] Delete project

- [ ] Develop `<ProjectDashboard />` admin UI:
  - [ ] Project selector dropdown at the top
  - [ ] "Create New Project" button with modal form
  - [ ] Tabbed interface for selected project:
    - [ ] Ads tab: List and manage project ads
    - [ ] Surveys tab: List and manage project surveys
    - [ ] Metrics tab: View project analytics and performance
  - [ ] Project settings section showing API key and other details

- [ ] Implement API key generation system:
  - [ ] Generate unique 32-character alphanumeric key
  - [ ] Store hashed version in database
  - [ ] Display full key only on project creation
  - [ ] Add ability to view API key in project settings

- [ ] Build relationships between projects and related entities:
  - [ ] One-to-many relationship with ads
  - [ ] One-to-many relationship with surveys
  - [ ] One-to-many relationship with metrics

### Frontend-Backend Integration
- [ ] Define API contracts for project CRUD, asset management, and metrics endpoints.
- [ ] Implement API client module in Admin Dashboard for project, ad, survey, and metrics endpoints.
- [ ] Integrate `<ProjectDashboard />` and related UI with backend APIs.
- [ ] Handle loading, error, and success states in admin dashboard UI.
- [ ] Mock backend endpoints for dashboard development/testing.
- [ ] Add integration tests for admin dashboard frontend-backend flows.

---

## Milestone 4: Backend Services
- [ ] Develop AdService to serve ads based on project context.
- [ ] Develop TrackingService to log user interactions with project/ad attribution.
- [ ] Develop SurveyService to manage surveys and responses.
- [ ] Set up SQL Server and Redis databases with proper relationships.
- [ ] Implement analytics aggregation endpoints by project.
- [ ] Add API authentication/authorization if required.
- [ ] Add error handling and validation for all endpoints.

---

## Milestone 5: Testing and Documentation
- [ ] Write comprehensive unit and integration tests for SDK components, hooks, and backend services.
- [ ] Document SDK usage, backend API contracts (with request/response examples), and survey config structure.
- [ ] Create project setup and integration guides for internal teams.
- [ ] Publish the SDK as a private NPM package.
- [ ] Set up CI/CD pipelines for SDK and backend services.

---

## General/Continuous Tasks
- [ ] Regular code reviews and refactoring.
- [ ] Update documentation as features evolve.
- [ ] Monitor analytics and feedback for improvements. 