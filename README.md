# Unified Calendar

A comprehensive calendar application that integrates events, tasks, and communications in a single interface. Built with React, Node.js, and MongoDB.

## Features

- **Unified Calendar View**
  - Day, week, and month views
  - Drag-and-drop event rescheduling
  - Real-time updates
  - Timezone support
  - Event conflict detection

- **Event Management**
  - Create and edit events
  - Set reminders and recurring events
  - Add attendees and teams
  - Color coding for different event types

- **Task Integration**
  - Task creation and tracking
  - Priority levels and progress tracking
  - Dependencies and tags
  - Team assignment

- **Email Integration**
  - Track important emails
  - Set response deadlines
  - Attach files and documents
  - Priority management

- **Team Collaboration**
  - Team calendar views
  - Member availability status
  - Permission controls
  - Real-time updates

- **Calendar Sharing & Export**
  - Share calendars with teams
  - Set permission levels
  - Export in multiple formats (iCalendar, CSV, JSON)
  - Custom date range selection

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Socket.io-client
- React Beautiful DnD
- date-fns
- React Icons
- React Toastify

### Backend
- Node.js
- Express
- MongoDB
- Socket.io
- JWT Authentication

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/unified-calendar.git
cd unified-calendar
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/unified-calendar
JWT_SECRET=your_jwt_secret
```

5. Start the development servers:

Backend:
```bash
cd backend
npm run dev
```

Frontend:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## Project Structure

```
unified-calendar/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── calendar/
│   │   │       ├── UnifiedCalendar.jsx
│   │   │       ├── CalendarView.jsx
│   │   │       ├── CalendarControls.jsx
│   │   │       ├── TeamAvailability.jsx
│   │   │       ├── EventModal.jsx
│   │   │       ├── TaskModal.jsx
│   │   │       └── CalendarSidebar.jsx
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
└── backend/
    ├── src/
    │   ├── controllers/
    │   ├── models/
    │   ├── routes/
    │   └── utils/
    └── package.json
```

## API Endpoints

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Teams
- `GET /api/teams` - Get all teams
- `POST /api/teams` - Create new team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team




## Acknowledgments

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [date-fns](https://date-fns.org/)