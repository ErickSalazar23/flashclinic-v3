# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flash Clinic is a clinical scheduling and patient management system built with Clean Architecture in TypeScript. It is NOT a chatbot. All logic lives under `src/`.

**Important:** Do not modify `saas-factory-setup-main2025/` - it is a separate template project.

## Architecture

### Clean Architecture Layers

```
src/
├── core/                    # Business rules (PURE, no external dependencies)
│   ├── domain/
│   │   ├── entities/        # Cita, Paciente, PendingDecision
│   │   ├── events/          # Immutable domain events (source of truth)
│   │   ├── policies/        # Deterministic business rules
│   │   └── value-objects/   # HistorialEstado, HistorialPrioridad
│   ├── decision-engine/     # Evaluates decisions, never executes
│   ├── use-cases/           # Orchestration (no business decisions)
│   └── ports/               # Interfaces for external dependencies
├── adapters/                # Implementations of ports
│   ├── database/            # InMemoryCitaRepository
│   ├── events/              # InMemoryEventPublisher
│   └── whatsapp/            # WhatsAppEventPublisher
└── infrastructure/          # External services (Supabase, n8n)
```

### Core Principles

1. **Events are the source of truth** - States are projections, not mutable fields
2. **Immutability** - Past events cannot be modified, only interpreted via new events
3. **Separation of concerns**:
   - Core does NOT know WhatsApp/Supabase
   - Adapters execute, they don't decide
   - Use cases orchestrate, they don't contain business rules

### Decision Engine (Autonomy Levels)

The system separates thinking from executing:
- **AUTOMATIC**: System executes without intervention
- **SUPERVISED**: Requires human approval before execution
- **BLOCKED**: Execution blocked due to ambiguity

Decision weights: LOW (simple), MEDIUM (standard analysis), HIGH (exhaustive, multiple options required)

### Cita (Appointment) State Machine

```
Solicitada → Confirmada → [Reprogramada] → Cancelada
                       → Atendida
                       → NoAsistió
```

States are tracked via `HistorialEstado` (state history), not a mutable field.

### Priority System

Priority (Alta/Media/Baja) is calculated automatically by `DeterminarPrioridadPolicy` based on:
- Urgency keywords in motivo
- Patient age (≥65 → Media)
- Wait time (>15 days escalates priority)

Human overrides are allowed but require justification and generate `PrioridadCitaSobrescritaPorHumano` events.

## Development Commands

This is a TypeScript project using Jest for testing:

```bash
# Run all tests
npx jest

# Run a specific test file
npx jest src/core/use-cases/SolicitarCitaUseCase.test.ts

# Run tests matching a pattern
npx jest --testNamePattern="AUTOMATIC"
```

## Code Conventions

- **Explicit, boring, readable code** - No invented frameworks
- All domain logic is deterministic semantic classification
- No free reasoning, no creativity, no hallucinated logic
- If ambiguity exists, emit a domain event to escalate

### Key Patterns

**Result type for use cases:**
```typescript
type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }
  | { ok: false; estado: "criterio_pendiente"; pendingDecisionId: string };
```

**Domain events are immutable:**
```typescript
interface DomainEvent {
  readonly ocurrioEn: Date;
}
```

**Entities return new instances + events on mutation:**
```typescript
cambiarEstado(nuevoEstado, ocurrioEn): { evento: EstadoCitaCambiado; nuevaCita: Cita }
```

## Critical Rules

1. Business rules live ONLY inside `src/core`
2. Never duplicate state across layers
3. Decisions like "RequiresHumanIntervention" belong to the domain
4. Priority changes must generate audit events
5. All "cognitive" behavior is deterministic - no AI hallucinations
