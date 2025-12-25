# Carnival Scoring App

## Overview

A New Year Carnival party scoring application designed for moderators to track player points during party games. This is a mobile-first, single-page web app built with a festive carnival theme that emphasizes instant usability in party environments with large touch targets, high contrast, and clear visual hierarchy.

The app allows moderators to manage a roster of players, award/deduct points with optional notes, view a live leaderboard with podium-style rankings for top 3, and undo the last score entry.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state, local React state for UI
- **Styling**: Tailwind CSS with custom carnival-themed design tokens
- **Component Library**: shadcn/ui (Radix UI primitives with custom styling)
- **Build Tool**: Vite with hot module replacement

The frontend follows a component-based architecture with:
- UI components in `client/src/components/ui/` (shadcn/ui library)
- Page components in `client/src/pages/`
- Custom hooks in `client/src/hooks/`
- Utility functions and storage in `client/src/lib/`

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **Development**: tsx for TypeScript execution
- **API Pattern**: RESTful endpoints prefixed with `/api`

The server structure:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route definitions
- `server/storage.ts` - Data access layer with storage interface
- `server/vite.ts` - Vite dev server integration
- `server/static.ts` - Production static file serving

### Data Storage
- **Current Implementation**: Client-side localStorage for player and score data
- **Database Schema**: Drizzle ORM with PostgreSQL configured (ready for migration)
- **Schema Location**: `shared/schema.ts` using Zod for validation

Data models:
- `Player`: id, name, totalPoints
- `ScoreLog`: id, playerId, points, note (optional), timestamp

### Design System
Following `design_guidelines.md`:
- Primary font: Poppins (Google Fonts)
- Carnival color accents: magenta/hot pink CTAs, electric blue secondary, gold/yellow success
- Minimum 48px touch targets for party-proof interaction
- Podium colors for top 3: Gold, Silver, Bronze backgrounds

## External Dependencies

### Frontend Libraries
- **@tanstack/react-query**: Server state management and caching
- **@radix-ui/\***: Accessible UI primitives (dialogs, dropdowns, tabs, etc.)
- **class-variance-authority**: Component variant styling
- **wouter**: Lightweight client-side routing
- **embla-carousel-react**: Carousel component
- **react-day-picker**: Calendar/date picker
- **lucide-react**: Icon library
- **date-fns**: Date utility functions
- **cmdk**: Command palette component
- **vaul**: Drawer component

### Backend Libraries
- **express**: Web server framework
- **drizzle-orm**: TypeScript ORM for database operations
- **drizzle-zod**: Zod schema generation from Drizzle schemas
- **zod**: Runtime type validation
- **connect-pg-simple**: PostgreSQL session store (ready for auth)

### Build & Development
- **vite**: Frontend build tool with HMR
- **esbuild**: Server bundling for production
- **drizzle-kit**: Database migration tooling
- **tsx**: TypeScript execution for Node.js

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Replit integration
- **@replit/vite-plugin-dev-banner**: Development banner

### Database
- PostgreSQL via `DATABASE_URL` environment variable
- Migrations output to `./migrations` directory
- Schema defined in `shared/schema.ts`