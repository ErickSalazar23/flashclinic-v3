export interface EliminarPendingDecisionPort {
    eliminar(id: string): Promise<void>;
}
