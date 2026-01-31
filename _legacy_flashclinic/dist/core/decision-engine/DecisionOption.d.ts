export interface DecisionOption {
    readonly id: string;
    readonly valor: unknown;
    readonly confianza: number;
    readonly razones: readonly string[];
}
