# FlashClinic V3 - Development Guide

> Intelligent clinic operations platform with automated decision-making and human-in-the-loop oversight.

---

## Project Overview

FlashClinic V3 is a production-ready healthcare appointment management system. The codebase is complete and follows established patterns.

### Core Features
- **Patient Management** - Registration, validation, recurring tracking
- **Appointment Scheduling** - Full lifecycle with state machine
- **Decision Engine** - Autonomy levels (AUTOMATIC, SUPERVISED, BLOCKED)
- **Human-in-the-Loop** - Pending decisions queue with approve/reject
- **Priority Overrides** - Manual adjustment with audit trail
- **Event System** - Domain events for full auditability

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 3.4 |
| Backend | Supabase (Auth + PostgreSQL + RLS) |
| Validation | Zod |
| Testing | Vitest |

---

## Architecture: Feature-First

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Login, Signup
│   └── (main)/            # Dashboard, Patients, Appointments, Decisions
│
├── features/              # Domain features (self-contained)
│   ├── auth/              # Authentication
│   ├── patients/          # Patient management
│   ├── appointments/      # Appointments + state machine
│   ├── decisions/         # Decision engine + rules
│   ├── dashboard/         # Dashboard UI
│   └── events/            # Domain event system
│
├── actions/               # Server Actions
└── shared/                # Shared components and utilities
```

### Feature Structure

Each feature follows this pattern:
```
feature/
├── components/     # React components
├── hooks/          # Custom hooks
├── services/       # Business logic
├── domain/         # Domain rules (state machine, validators)
├── types/          # TypeScript types + Zod schemas
└── ports/          # Repository interfaces (hexagonal)
```

---

## Code Guidelines

### Principles
- **KISS**: Simple solutions over clever ones
- **YAGNI**: Only implement what's needed
- **DRY**: Extract when you see real duplication
- **Feature-First**: All feature code in one place

### Limits
- Files: Max 500 lines
- Functions: Max 50 lines
- Components: Single responsibility

### Naming
- Variables/Functions: `camelCase`
- Components: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Files/Folders: `kebab-case`

### TypeScript
- Always type function signatures
- Use `interface` for object shapes
- Use `type` for unions
- Never use `any` (use `unknown`)

---

## Commands

```bash
npm run dev          # Development server (Turbopack)
npm run build        # Production build
npm run test         # Run tests
npm run lint         # ESLint
```

---

## Testing

Tests use Vitest with AAA pattern:

```typescript
test('should calculate total', () => {
  // Arrange
  const items = [{ price: 100 }]

  // Act
  const result = calculateTotal(items)

  // Assert
  expect(result).toBe(100)
})
```

**Current coverage:** 127 tests passing

---

## Security

- All inputs validated with Zod
- RLS enabled on all Supabase tables
- Auth required for protected routes (middleware)
- No secrets in code

---

## Key Files

| File | Purpose |
|------|---------|
| `src/features/decisions/engine/` | Decision engine implementation |
| `src/features/appointments/domain/stateMachine.ts` | Appointment state transitions |
| `src/middleware.ts` | Auth route protection |
| `supabase/migrations/` | Database schema |
| `docs/DECISION_ENGINE.md` | Decision system documentation |

---

*FlashClinic V3 - Production-ready intelligent clinic operations.*
