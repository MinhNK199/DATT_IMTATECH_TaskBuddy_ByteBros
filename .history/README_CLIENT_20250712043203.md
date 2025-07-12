# TaskBuddy Client Application

## Overview

TaskBuddy Client is a React/TypeScript application that provides a user-friendly interface to manage tasks, track progress, and organize work efficiently. The client application interacts with the TaskBuddy backend API to perform CRUD operations on tasks, manage user authentication, and handle user preferences.

## Features

### Authentication
- User registration with email/password
- Login with existing credentials
- Secure token-based authentication
- Protected routes for authenticated users

### Dashboard
- Overview of task statistics (total, completed, overdue)
- Recent tasks list
- Quick action links

### Task Management
- Create new tasks with detailed information:
  - Title and description
  - Category (personal, work, study)
  - Priority (low, medium, high)
  - Due date
  - Estimated hours
- Filter tasks by status, category, and priority
- Search tasks by keyword
- Update task status
- Delete tasks
- Visual indicators for priority, status, and overdue tasks

### User Profile
- View user information
- Edit display name
- Configure user preferences:
  - Theme (light/dark)
  - Notifications
  - AI suggestions

## Application Structure

```
frontend/src/
  ├── client/                   # Client application components
  │   ├── ClientLayout.tsx      # Main layout with navigation and footer
  │   ├── Home.tsx              # Dashboard component
  │   ├── Login.tsx             # Authentication - login form
  │   ├── Profile.tsx           # User profile management
  │   ├── Register.tsx          # Authentication - registration form
  │   └── TaskClient.tsx        # Task management interface
  │
  ├── services/
  │   └── api.ts                # API service for backend communication
  │
  ├── interfaces/
  │   └── interfaces.ts         # TypeScript interfaces
  │
  └── App.tsx                   # Main application component with routing
```

## Technologies Used

- **React**: Frontend library
- **TypeScript**: Type checking and improved development experience
- **React Router**: Navigation and routing
- **Axios**: API requests
- **TailwindCSS**: Styling and UI components

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```
   cd frontend
   npm install
   ```
3. Configure environment variables:
   - Create `.env` file with `REACT_APP_API_URL` pointing to your backend
4. Start the development server:
   ```
   npm start
   ```

## API Integration

The client communicates with the backend API through the `api.ts` service, which:
- Sets up an Axios instance with the base URL
- Adds authentication tokens to requests
- Handles authentication errors
- Provides common error handling

## Routing

The application uses React Router with the following main routes:
- `/login`, `/register`: Public authentication routes
- `/`: Home/dashboard (protected)
- `/tasks`: Task management (protected)
- `/profile`: User profile (protected)
- `/admin/*`: Admin routes (protected)

## Security Features

- JWT token-based authentication
- Protected routes with authentication checks
- Secure token storage in localStorage
- Automatic redirection to login for unauthenticated users 