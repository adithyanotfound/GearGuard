# GearGuard - Enterprise Maintenance Tracker

A comprehensive enterprise maintenance management system built with Next.js, TypeScript, Prisma, and PostgreSQL.

## Team

- Sarthak Jha (Sarthak696969) - Team Leader
- Adithya (adithyanotfound)
- Raghav Tiwari (RaghavTiwari31)
- Harshit Jain (HarshitJain2103)

## Features

- **Role-Based Access Control (RBAC)**: Four distinct roles (ADMIN, MANAGER, TECHNICIAN, EMPLOYEE) with granular permissions
- **Maintenance Request Management**: Full lifecycle tracking from creation to completion
- **Kanban Board**: Visual drag-and-drop interface with RBAC-enforced transitions
- **Dashboard**: RBAC-aware metrics and request overview
- **Equipment Management**: Track equipment, categories, teams, and work centers
- **Maintenance Calendar**: Schedule and view preventive maintenance
- **Black & White UI**: Clean, enterprise-grade interface

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **UI**: shadcn/ui components with Tailwind CSS
- **Authentication**: Custom session-based auth

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GearGuard
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/gearguard?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
SESSION_SECRET="your-session-secret-here"
```

4. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed the database
npm run db:seed
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Test Accounts

After seeding, you can use these test accounts:

- **Admin**: admin@gearguard.com / Admin123!
- **Manager**: manager@gearguard.com / Manager123!
- **Technician**: tech1@gearguard.com / Tech123!
- **Employee**: employee1@gearguard.com / Employee123!

## Role Capabilities

### EMPLOYEE
- Create maintenance requests
- View own requests
- Add notes to own requests
- Move requests from NEW → IN_PROGRESS (if unassigned)

### TECHNICIAN
- View assigned requests
- Assign self to unassigned requests
- Update schedule, duration, and notes
- Move requests: NEW → IN_PROGRESS → REPAIRED

### MANAGER
- View all requests
- Assign technicians and teams
- Edit priority, schedule, and team
- Create preventive maintenance
- View dashboard metrics

### ADMIN
- All Manager capabilities
- Manage equipment, categories, teams, work centers
- Scrap requests
- View and manage all users
- Override any request state

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── requests/          # Request pages
│   ├── kanban/            # Kanban board
│   ├── calendar/          # Maintenance calendar
│   └── ...                # Other pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── layout/            # Layout components
│   └── ...               # Feature components
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication
│   ├── rbac.ts           # RBAC logic
│   └── prisma.ts         # Prisma client
└── prisma/               # Prisma schema and seed
```

## API Routes

All API routes are protected with RBAC:
- `/api/auth/*` - Authentication endpoints
- `/api/requests/*` - Maintenance request CRUD
- `/api/equipment/*` - Equipment management (Admin only)
- `/api/categories/*` - Category management (Admin only)
- `/api/teams/*` - Team management (Admin only)
- `/api/work-centers/*` - Work center management (Admin only)
- `/api/users/*` - User management (Admin/Manager only)
- `/api/dashboard/metrics` - Dashboard metrics

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Database commands
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema changes
npm run db:seed      # Seed database
```

## License

This project is part of the Runtime Terrors team submission.
