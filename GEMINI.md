# FlashClinic V3 - Repository Guide

> Intelligent clinic operations platform with automated decision-making and human-in-the-loop oversight.

## Project Overview

This repository contains **FlashClinic V3**, a production-ready healthcare appointment management system. The application is complete with all core functionality implemented and tested.

### Key Capabilities
- Patient management with validation and tracking
- Appointment scheduling with full lifecycle state machine
- Intelligent decision engine with autonomy levels
- Human-in-the-loop approval workflow
- Priority override system with audit trails
- Event-driven architecture for full auditability

## Repository Structure

```
flashclinic-v3/
├── CLAUDE.md               # Repository guide (for Claude)
├── GEMINI.md               # This file (for Gemini)
├── README.md               # Product documentation
├── CHANGELOG.md            # Version history
│
└── saas-factory/           # Application code
    ├── CLAUDE.md           # Development guide
    ├── GEMINI.md           # Development guide (mirror)
    ├── package.json        # Dependencies
    ├── src/                # Source code
    │   ├── app/            # Next.js App Router
    │   ├── features/       # Feature-First architecture
    │   ├── actions/        # Server Actions
    │   └── shared/         # Shared components
    │
    ├── supabase/
    │   └── migrations/     # Database schema
    │
    └── docs/
        └── DECISION_ENGINE.md  # Decision system docs
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 3.4 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Validation | Zod |
| Testing | Vitest |

## Quick Start

```bash
cd saas-factory
npm install
cp .env.example .env.local  # Add Supabase credentials
npm run dev
```

## Development

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests (127 passing)
npm run lint         # ESLint
```

## Features

### Patients (`src/features/patients/`)
- CRUD operations
- Validation (name, email, phone, birth date)
- Recurring patient flag

### Appointments (`src/features/appointments/`)
- Six-state workflow: REQUESTED → CONFIRMED → RESCHEDULED → ATTENDED/NO_SHOW/CANCELLED
- State machine with transition validation
- Priority levels (LOW, MEDIUM, HIGH)
- Status and priority history tracking

### Decisions (`src/features/decisions/`)
- Autonomy levels: AUTOMATIC, SUPERVISED, BLOCKED
- Rule-based evaluation (priority escalation, state transitions)
- Pending decisions queue
- Approve/reject with idempotency guarantees

### Events (`src/features/events/`)
- Domain event publishing
- Event dispatcher for handlers
- Queryable audit trail

## Documentation

- **README.md** - Product overview and setup
- **saas-factory/CLAUDE.md** - Development guidelines
- **saas-factory/docs/DECISION_ENGINE.md** - Decision system reference

---

*FlashClinic V3 - Production-ready intelligent clinic operations.*
