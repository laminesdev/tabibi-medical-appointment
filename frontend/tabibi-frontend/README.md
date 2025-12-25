# Tabibi Medical Appointment System - Frontend

This is the frontend implementation of the Tabibi Medical Appointment System, a web-based platform that facilitates medical appointment scheduling between patients and doctors.

## Project Structure

```
src/
├── assets/                 # Images, icons, and other assets
├── components/             # Reusable UI components
│   ├── common/            # Common components used across roles
│   ├── forms/             # Form components
│   ├── layout/            # Layout components (Header, Footer, etc.)
│   └── ui/                # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and libraries
│   ├── services/         # API service layer
│   └── utils/            # Helper functions
├── routes/                # Route components for each user role
│   ├── visitor/           # Public routes (landing, search, etc.)
│   ├── patient/           # Patient-specific routes
│   ├── doctor/            # Doctor-specific routes
│   └── admin/             # Admin-specific routes
├── stores/                # Zustand stores for state management
├── types/                 # TypeScript types and interfaces
├── App.tsx                # Main App component with routing
└── main.tsx               # Application entry point
```

## Technology Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Icons**: react-icons
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Animations**: framer-motion

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Implementation Progress

See [tasks.md](../../tasks.md) for detailed implementation progress tracking.
