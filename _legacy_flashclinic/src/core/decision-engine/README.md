# Decision Engine

Módulo de decisión del sistema. Separa pensar de ejecutar.

## Principio

Este módulo NO ejecuta nada. Solo:
- Analiza inputs
- Evalúa escenarios
- Devuelve recomendaciones estructuradas

## Ley 3: Gestión del Criterio

El sistema gestiona el criterio como recurso limitado:
- **LOW**: Decisiones simples, camino directo, sin tradeoffs complejos
- **MEDIUM**: Análisis estándar con opciones y tradeoffs
- **HIGH**: Análisis exhaustivo, múltiples opciones obligatorias, intervención humana si confianza baja

## Ley 4: Umbral de Autonomía

El sistema define cuándo puede actuar solo y cuándo debe escalar:
- **AUTOMATIC**: El sistema puede ejecutar automáticamente (LOW siempre, HIGH sin intervención)
- **SUPERVISED**: Requiere supervisión humana antes de ejecutar (HIGH + requiereIntervencionHumana)
- **BLOCKED**: Bloquea la ejecución por ambigüedad extrema

## Estructura

- `DecisionEngine`: Motor principal que enruta decisiones
- `DecisionContext`: Contexto de entrada (tipo + datos + peso)
- `DecisionResult`: Resultado con opciones, tradeoffs y recomendación
- `DecisionWeight`: Peso de la decisión (LOW/MEDIUM/HIGH)
- `decisions/`: Decisiones específicas del dominio

## Uso

```typescript
const engine = new DecisionEngine();
const contexto: DecisionContext = {
  tipo: "prioridad_cita",
  peso: "HIGH", // LOW, MEDIUM o HIGH
  datos: { motivo: "...", edad: 65, tiempoEsperaDias: 10 }
};

const resultado = engine.evaluar(contexto);
// resultado.recomendacionPrincipal contiene la recomendación
// resultado.requiereIntervencionHumana indica si necesita revisión
// resultado.tradeoffs está vacío para LOW, completo para HIGH
```
