# TaskBuddy - Client Application

This directory contains the client application components for TaskBuddy - a task management application that helps users organize and manage their tasks efficiently.

## Components

### Authentication
- `Login.tsx` - Login form for existing users
- `Register.tsx` - Registration form for new users

### Main Components
- `ClientLayout.tsx` - Layout component with navigation and common UI elements
- `Home.tsx` - Dashboard/homepage with task statistics and quick actions
- `TaskClient.tsx` - Task management interface for creating, viewing, and managing tasks
- `Profile.tsx` - User profile management

## Features

1. **User Authentication**
   - Login with email/password
   - New user registration
   - Session management with JWT tokens

2. **Task Management**
   - Create new tasks with title, description, category, priority, due date
   - View all tasks with filtering options (status, category, priority)
   - Update task status
   - Delete tasks
   - Visual indicators for task priority and status

3. **User Profile**
   - View and edit user information
   - Configure preferences (theme, notifications, AI suggestions)

## API Integration

The client components communicate with the TaskBuddy backend API using the service defined in `../services/api.ts`. All API requests include authentication tokens for protected endpoints.

## Routing

The application uses React Router for navigation between different views. Protected routes require authentication, and users are redirected to the login page if they're not authenticated.

## Usage

1. Import the components into the main application
2. Set up routes in the App component
3. Ensure the API service is configured with the correct backend URL

## Dependencies

- React
- React Router
- Axios for API requests
- TailwindCSS for styling 