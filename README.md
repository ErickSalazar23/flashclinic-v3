# FlashClinic V3

> Intelligent clinic operations platform with automated decision-making and human-in-the-loop oversight.

FlashClinic V3 is a production-ready healthcare appointment management system featuring an intelligent decision engine, priority-based workflow automation, and comprehensive audit trails.

---

## Features

### Patient Management
- Patient registration with validation (name, email, phone, birth date)
- Recurring patient tracking
- Age-based priority consideration

### Appointment Scheduling
- Full appointment lifecycle management
- Six-state workflow: REQUESTED → CONFIRMED → RESCHEDULED → ATTENDED / NO_SHOW / CANCELLED
- Specialty-based scheduling
- Priority levels (LOW, MEDIUM, HIGH)

### Decision Engine
- **Autonomy Levels**: AUTOMATIC, SUPERVISED, BLOCKED
- **Priority Escalation**: Time-based automatic escalation (7 days LOW→MEDIUM, 14 days MEDIUM→HIGH)
- **State Machine Validation**: Prevents invalid status transitions
- **Conflict Detection**: Flags ambiguous or high-risk situations

### Human-in-the-Loop Approvals
- Pending decisions queue with weight-based prioritization
- Approve/Reject workflow with required justifications
- Idempotent operations (safe retries)

### Priority Overrides
- Manual priority adjustment with audit trail
- Origin tracking (SYSTEM vs HUMAN)
- Minimum 10-character justification requirement

### Event-Driven Auditability
- Domain events for all state changes
- Complete status and priority history (JSONB)
- Queryable audit trail via Server Actions

---

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, Signup
│   └── (main)/            # Dashboard, Patients, Appointments, Decisions
│
├── features/              # Feature-First Architecture
│   ├── auth/              # Authentication (Supabase Auth)
│   ├── patients/          # Patient management
│   ├── appointments/      # Appointment scheduling + state machine
│   ├── decisions/         # Decision engine + rules
│   ├── dashboard/         # Dashboard + navigation
│   └── events/            # Domain event system
│
├── actions/               # Server Actions (Next.js 16)
│   ├── auth/              # login, signup, logout, getSession
│   ├── patients/          # CRUD operations
│   ├── appointments/      # requestAppointment, updateStatus, overridePriority
│   ├── decisions/         # approveDecision, rejectDecision
│   └── events/            # Event queries
│
├── shared/                # Shared utilities
│   ├── components/        # ErrorBoundary, LoadingStates
│   └── lib/               # Supabase client
│
└── lib/
    └── supabase/          # Server + Browser clients
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Validation | Zod |
| Testing | Vitest (127 tests) |

---

## Local Development

### Prerequisites
- Node.js 18+
- Supabase project (or local Supabase)

### Setup

```bash
# Clone the repository
git clone https://github.com/ErickSalazar23/flashclinic-v3.git
cd flashclinic-v3/saas-factory

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# Run database migrations
# (Apply migrations from supabase/migrations/ to your Supabase project)

# Start development server
npm run dev
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Available Scripts

```bash
npm run dev          # Start development server (Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Run tests (Vitest)
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
```

---

## Database Schema

Six migrations define the complete schema:

1. **001_flashclinic_schema** - Core tables (patients, appointments, pending_decisions, domain_events)
2. **002_patient_fields** - Patient validation constraints
3. **003_appointment_fields** - Appointment scheduling fields
4. **004_appointment_state_machine** - Status enum expansion + history tracking
5. **005_pending_decisions_resolution** - Decision resolution workflow
6. **006_priority_override** - Priority history with origin tracking

All tables have Row Level Security (RLS) enabled.

---

## Documentation

- [Decision Engine Guide](saas-factory/docs/DECISION_ENGINE.md) - How the automated decision system works

---

## Test Coverage

```
127 tests passing across 7 test files:
- State machine transitions (40 tests)
- Decision flow integration (21 tests)
- Idempotency guarantees (19 tests)
- Decision engine (12 tests)
- Evaluator logic (20 tests)
- Priority escalation rules (9 tests)
- Status transition rules (6 tests)
```

---

## License

MIT

---

*FlashClinic V3 - Intelligent clinic operations, production-ready.*
