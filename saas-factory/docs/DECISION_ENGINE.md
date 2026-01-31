# FlashClinic Decision Engine

> A guide to understanding how FlashClinic's automated decision system works.

## Overview

FlashClinic uses an intelligent decision engine to help manage appointments efficiently. The system can make routine decisions automatically while flagging complex situations for human review.

## How It Works

### Autonomy Levels

The system operates with three autonomy levels:

| Level | What it means | When it applies |
|-------|--------------|-----------------|
| **AUTOMATIC** | System handles it completely | Routine, low-risk decisions |
| **SUPERVISED** | System recommends, human approves | Moderate complexity or risk |
| **BLOCKED** | Human must decide | Ambiguous or high-risk situations |

### Decision Weights

Each decision is assigned a weight indicating its importance:

| Weight | Priority | Response Time |
|--------|----------|---------------|
| **LOW** | Can wait | Within 48 hours |
| **MEDIUM** | Should review soon | Within 24 hours |
| **HIGH** | Needs attention | As soon as possible |

---

## Priority Escalation Rules

The system automatically monitors appointments and suggests priority changes when needed.

### Rule 1: Time-Based Escalation

**When appointments wait too long, priorities escalate:**

| Current Priority | Waiting Time | New Priority | Action |
|-----------------|--------------|--------------|--------|
| LOW | > 7 days | MEDIUM | Supervisor reviews |
| MEDIUM | > 14 days | HIGH | Manager reviews |

**Example:**
> A LOW priority appointment created 10 days ago will be flagged for escalation to MEDIUM priority. A supervisor will review and approve or deny the change.

### Rule 2: Terminal State Transitions

**When appointments reach final states, human confirmation is required:**

- Marking as **ATTENDED** (patient showed up)
- Marking as **NO SHOW** (patient didn't appear)
- **CANCELLING** an appointment

These actions cannot be undone, so the system asks for confirmation.

---

## Appointment Status Flow

Appointments follow a defined workflow:

```
REQUESTED → CONFIRMED → ATTENDED
              ↓
         RESCHEDULED → CONFIRMED
              ↓
           CANCELLED

CONFIRMED → NO SHOW
```

### Valid Transitions

| From Status | Can Go To |
|-------------|-----------|
| REQUESTED | CONFIRMED, CANCELLED |
| CONFIRMED | RESCHEDULED, ATTENDED, NO SHOW, CANCELLED |
| RESCHEDULED | CONFIRMED, CANCELLED |
| ATTENDED | (Final - cannot change) |
| NO SHOW | (Final - cannot change) |
| CANCELLED | (Final - cannot change) |

### Invalid Transitions

The system will **BLOCK** any attempt to:
- Go backwards (e.g., CONFIRMED → REQUESTED)
- Change a final status (e.g., CANCELLED → CONFIRMED)
- Skip steps (e.g., REQUESTED → ATTENDED)

---

## Priority Override

Staff can manually override appointment priorities when needed.

### Requirements for Override

1. **Justification required** - Must explain why (minimum 10 characters)
2. **Cannot override terminal appointments** - Once attended/cancelled/no-show, priority is locked
3. **Full audit trail** - All overrides are recorded with who, when, and why

### Example Override Scenarios

| Scenario | Action |
|----------|--------|
| Patient's condition worsens | Override LOW → HIGH with medical justification |
| Follow-up needed sooner | Override LOW → MEDIUM with clinical notes |
| Scheduling error | Override to correct priority with explanation |

---

## Pending Decisions Queue

When the system encounters situations requiring human judgment, it creates a **Pending Decision**.

### What Goes in the Queue

- Priority escalation recommendations
- Terminal state transitions
- Ambiguous situations
- High-risk decisions

### Decision Dashboard

Staff can view pending decisions sorted by:
- **Weight** (HIGH first)
- **Creation date** (oldest first)
- **Type** (appointments, etc.)

### Processing Decisions

| Action | What Happens |
|--------|--------------|
| **Approve** | System executes the recommended action |
| **Reject** | Action is cancelled, reason recorded |

Both actions are **idempotent** - if you click approve twice, it won't create duplicate records.

---

## Idempotency Guarantees

The system is designed to handle duplicate actions safely:

| Scenario | Result |
|----------|--------|
| Approve an already-approved decision | Success (no change) |
| Reject an already-rejected decision | Success (no change) |
| Approve a rejected decision | Error (not allowed) |
| Reject an approved decision | Error (not allowed) |
| Override to same priority | Success (no change) |

---

## Audit Trail

All decisions are logged with:

- **Who** made the decision
- **When** it was made
- **What** was decided
- **Why** (justification/notes)

### Viewing History

Each appointment and patient has a complete history of:
- Status changes (with timestamps)
- Priority changes (system vs manual)
- Decision approvals/rejections

---

## Frequently Asked Questions

### Q: What if the system makes a wrong recommendation?

The system only recommends actions for SUPERVISED and BLOCKED levels. Humans always have final say. If you disagree with a recommendation, simply reject it with your reasoning.

### Q: Can I undo an approval?

Once an appointment reaches a terminal state (ATTENDED, NO SHOW, CANCELLED), it cannot be changed. For non-terminal states, you can make corrections through new actions.

### Q: Why is my decision BLOCKED?

BLOCKED means the situation is ambiguous or high-risk. Common reasons:
- Invalid status transition attempted
- Long-pending MEDIUM priority appointment
- Conflicting information

### Q: How do I know what needs my attention?

Check the **Pending Decisions** dashboard. HIGH weight items appear first and should be addressed promptly.

### Q: Who can approve decisions?

Any authenticated staff member can view pending decisions. Specific approval permissions depend on your organization's configuration.

---

## Technical Details

For developers and technical staff, see:
- `src/features/decisions/engine/` - Decision engine implementation
- `src/features/decisions/engine/rules/` - Business rules
- `src/features/appointments/domain/stateMachine.ts` - Status transitions

---

*Last updated: 2026-01-30*
*Version: 1.0*
