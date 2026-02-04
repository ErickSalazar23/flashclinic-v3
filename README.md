# Flash Clinic CRM - Enterprise Edition

Sistema CRM de última generación para adquisición de médicos con análisis de "hemorragia financiera" y diagnóstico automatizado.

## 🎯 Características Principales

- **Motor de Diagnóstico Financiero**: Análisis automático de pérdidas por sillas vacías y no-shows
- **Clasificación de Severidad**: Sistema de 4 niveles (Critical, Severe, Moderate, Stable)
- **Lenguaje Clínico**: Reportes con terminología médica agresiva para crear urgencia
- **Pipeline Híbrido**: 4 estados de gestión de prospectos
- **Persistencia Automática**: localStorage con sincronización en tiempo real
- **Sistema de Recomendaciones**: Tratamientos priorizados con impacto calculado

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                    UI LAYER (Futuro)                    │
│                  Dashboard | Pipeline                   │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  STATE MANAGEMENT                       │
│                    store.js                             │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  BUSINESS LOGIC                         │
│         diagnostic-engine.js | data-models.js           │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                 DATA PERSISTENCE                        │
│                   localStorage                          │
└─────────────────────────────────────────────────────────┘
```

## 📦 Componentes

### Core System
- **`data-models.js`** - Modelos de datos (Prospect, Diagnostic, Activity, Settings)
- **`diagnostic-engine.js`** - Motor de análisis financiero con lenguaje clínico
- **`store.js`** - State management con localStorage persistence

### Testing & Demo
- **`test-store.js`** - Suite de 14 tests automatizados
- **`test-store-runner.html`** - Test runner con UI Cyber-Medicine
- **`demo-core-system.html`** - Demostración interactiva del sistema core
- **`test-diagnostic.html`** - Test del motor de diagnóstico

## 🚀 Quick Start

### 1. Clonar el repositorio
```bash
git clone https://github.com/ErickSalazar23/flashclinic-v3.git
cd flashclinic-v3
```

### 2. Iniciar servidor local
```bash
npx http-server ./crm -p 8080
```

### 3. Abrir demos
- **Demo Core System**: http://localhost:8080/demo-core-system.html
- **Test Runner**: http://localhost:8080/test-store-runner.html
- **Test Diagnóstico**: http://localhost:8080/test-diagnostic.html

## 🧪 Testing

El sistema incluye 14 tests automatizados que validan:

1. ✅ Store Initialization
2. ✅ Create Prospect (sin diagnóstico)
3. ✅ Create Prospect (con diagnóstico automático)
4. ✅ Update Prospect (recálculo automático)
5. ✅ Move Through Pipeline
6. ✅ Add Activity
7. ✅ Delete Prospect
8. ✅ Pipeline Statistics
9. ✅ Critical Prospects Detection
10. ✅ Top Opportunities Ranking
11. ✅ localStorage Persistence
12. ✅ Export/Import Data
13. ✅ Diagnostic Engine Accuracy
14. ✅ Settings Update & Recalculation

### Ejecutar tests
Abre `http://localhost:8080/test-store-runner.html` y click en "Run All Tests"

**Resultado esperado**: `14 passed, 0 failed`

## 💡 Uso del API

### Crear Prospecto
```javascript
const prospect = store.createProspect({
  doctorName: 'Dr. Juan Pérez',
  specialty: 'Cardiología',
  citasSemanales: 20,
  ticketPromedio: 150000,
  noShowPercentage: 25,
  slotsDisponibles: 40
});
// ✅ Diagnóstico calculado automáticamente
// ✅ Guardado en localStorage
```

### Mover por Pipeline
```javascript
store.moveProspectToStage(prospect.id, 'diagnostico_proceso');
// ✅ Activity log creado automáticamente
```

### Obtener Estadísticas
```javascript
const stats = store.getPipelineStats();
console.log(stats.totalPerdidaAnual); // Pérdida total en COP
console.log(stats.byStage); // Distribución por etapa
console.log(stats.bySeverity); // Distribución por severidad
```

### Identificar Casos Críticos
```javascript
const critical = store.getCriticalProspects();
// Retorna prospectos con severity === 'critical'
```

## 📊 Ejemplo de Análisis

**Input:**
- Citas Semanales: 20
- Ticket Promedio: $150.000 COP
- No-Show: 25%
- Slots Disponibles: 40

**Output:**
```javascript
{
  perdidaAnual: 180000000,        // $180M COP
  sillaVaciaPercentage: 50,       // 50% capacidad sin usar
  rentabilidadPercentage: 37.5,   // 37.5% rentabilidad actual
  severity: 'critical',           // Clasificación crítica
  severityScore: 51.25,           // Score de severidad
  diagnosticText: '🚨 HEMORRAGIA CRÍTICA DETECTADA...',
  recommendations: [...]          // Tratamientos sugeridos
}
```

## 🎨 Diseño

**Cyber-Medicine Aesthetic:**
- Dark mode (#0a0e1a background)
- Cyan accents (#00d2ff)
- Fuente Outfit de Google Fonts
- Glassmorphism effects
- Animaciones suaves

## 📁 Estructura del Proyecto

```
flashclinic-v3/
├── crm/
│   ├── data-models.js              # Modelos de datos
│   ├── diagnostic-engine.js        # Motor de diagnóstico
│   ├── store.js                    # State management
│   ├── test-store.js               # Test suite
│   ├── test-store-runner.html      # Test runner UI
│   ├── demo-core-system.html       # Demo interactiva
│   └── test-diagnostic.html        # Test diagnóstico
└── README.md
```

## 🔬 Validación de Cálculos

Todos los cálculos financieros están validados:

```javascript
// Pérdida por No-Show
perdidaNoShow = citasSemanales × (noShowPercentage/100) × ticketPromedio × 48

// Costo de Oportunidad (Sillas Vacías)
sillasVacias = slotsDisponibles - citasSemanales
costoOportunidad = sillasVacias × ticketPromedio × 48

// Pérdida Total
perdidaAnual = perdidaNoShow + costoOportunidad
```

## 🚧 Roadmap

- [x] Core data models
- [x] Diagnostic engine
- [x] State management con localStorage
- [x] Test suite completo
- [ ] Dashboard UI con gráficos de pastel
- [ ] Pipeline UI con drag-and-drop
- [ ] Exportación de reportes HTML/PDF
- [ ] Sistema de notificaciones

## 📝 Licencia

MIT

## 👨‍💻 Autor

Erick Salazar - [GitHub](https://github.com/ErickSalazar23)

---

**Enterprise CRM Flash Clinic** - Transformando sillas vacías en oportunidades de recuperación financiera.
