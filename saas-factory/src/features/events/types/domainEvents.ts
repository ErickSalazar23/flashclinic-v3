import type {
  EventType,
  AggregateType,
  PatientCreatedPayload,
  AppointmentCreatedPayload,
  AppointmentStatusChangedPayload,
  AppointmentPriorityChangedPayload,
  AppointmentConfirmedPayload,
  AppointmentRescheduledPayload,
  AppointmentAttendedPayload,
  AppointmentNoShowPayload,
  AppointmentCancelledPayload,
  DecisionCreatedPayload,
  DecisionResolvedPayload,
  DecisionApprovedPayload,
  DecisionRejectedPayload,
} from './schemas'

// ============================================
// Domain Event Base Interface
// ============================================

export interface BaseDomainEvent<
  TType extends EventType = EventType,
  TPayload = Record<string, unknown>
> {
  id: string
  aggregate_type: AggregateType
  aggregate_id: string
  event_type: TType
  payload: TPayload
  created_at: string
}

// ============================================
// Typed Domain Events
// ============================================

export interface PatientCreatedEvent
  extends BaseDomainEvent<'PATIENT_CREATED', PatientCreatedPayload> {
  aggregate_type: 'PATIENT'
}

export interface PatientUpdatedEvent
  extends BaseDomainEvent<'PATIENT_UPDATED', Partial<PatientCreatedPayload>> {
  aggregate_type: 'PATIENT'
}

export interface PatientDeletedEvent
  extends BaseDomainEvent<'PATIENT_DELETED', { deleted_reason?: string }> {
  aggregate_type: 'PATIENT'
}

export interface AppointmentCreatedEvent
  extends BaseDomainEvent<'APPOINTMENT_CREATED', AppointmentCreatedPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentStatusChangedEvent
  extends BaseDomainEvent<'APPOINTMENT_STATUS_CHANGED', AppointmentStatusChangedPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentPriorityChangedEvent
  extends BaseDomainEvent<'APPOINTMENT_PRIORITY_CHANGED', AppointmentPriorityChangedPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentConfirmedEvent
  extends BaseDomainEvent<'APPOINTMENT_CONFIRMED', AppointmentConfirmedPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentRescheduledEvent
  extends BaseDomainEvent<'APPOINTMENT_RESCHEDULED', AppointmentRescheduledPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentAttendedEvent
  extends BaseDomainEvent<'APPOINTMENT_ATTENDED', AppointmentAttendedPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentNoShowEvent
  extends BaseDomainEvent<'APPOINTMENT_NO_SHOW', AppointmentNoShowPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface AppointmentCancelledEvent
  extends BaseDomainEvent<'APPOINTMENT_CANCELLED', AppointmentCancelledPayload> {
  aggregate_type: 'APPOINTMENT'
}

export interface DecisionCreatedEvent
  extends BaseDomainEvent<'DECISION_CREATED', DecisionCreatedPayload> {
  aggregate_type: 'PENDING_DECISION'
}

export interface DecisionResolvedEvent
  extends BaseDomainEvent<'DECISION_RESOLVED', DecisionResolvedPayload> {
  aggregate_type: 'PENDING_DECISION'
}

export interface DecisionApprovedEvent
  extends BaseDomainEvent<'DECISION_APPROVED', DecisionApprovedPayload> {
  aggregate_type: 'PENDING_DECISION'
}

export interface DecisionRejectedEvent
  extends BaseDomainEvent<'DECISION_REJECTED', DecisionRejectedPayload> {
  aggregate_type: 'PENDING_DECISION'
}

// ============================================
// Union Type for All Domain Events
// ============================================

export type TypedDomainEvent =
  | PatientCreatedEvent
  | PatientUpdatedEvent
  | PatientDeletedEvent
  | AppointmentCreatedEvent
  | AppointmentStatusChangedEvent
  | AppointmentPriorityChangedEvent
  | AppointmentConfirmedEvent
  | AppointmentRescheduledEvent
  | AppointmentAttendedEvent
  | AppointmentNoShowEvent
  | AppointmentCancelledEvent
  | DecisionCreatedEvent
  | DecisionResolvedEvent
  | DecisionApprovedEvent
  | DecisionRejectedEvent

// ============================================
// Event Handler Interface
// ============================================

export interface DomainEventHandler<TEvent extends TypedDomainEvent = TypedDomainEvent> {
  readonly eventType: TEvent['event_type']
  handle(event: TEvent): Promise<void>
}

// ============================================
// Event Publisher Interface (Port)
// ============================================

export interface EventPublisherPort {
  publish(event: Omit<TypedDomainEvent, 'id' | 'created_at'>): Promise<void>
  publishMany(events: Omit<TypedDomainEvent, 'id' | 'created_at'>[]): Promise<void>
}

// ============================================
// Event Dispatcher Interface
// ============================================

export interface EventDispatcher {
  register<TEvent extends TypedDomainEvent>(
    handler: DomainEventHandler<TEvent>
  ): void
  dispatch(event: TypedDomainEvent): Promise<void>
}
