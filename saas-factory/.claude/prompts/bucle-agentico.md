# 🏭 Metodología SaaS Factory

> *"La línea de ensamblaje de Ford aplicada al software. Estandarización radical + Automatización total."*

Metodología sistemática para construir SaaS en minutos mediante deconstrucción, planificación jerárquica y ejecución iterativa.

## Filosofía

**Henry Ford:** Un solo modelo "T" perfeccionado → Un solo stack (Next.js + Supabase + IA)
**Elon Musk:** La máquina que construye la máquina → Los comandos que construyen el SaaS

## El Proceso de Ensamblaje

El **SaaS Factory** es un proceso donde el agente:
1. **Delimita** el problema de negocio (no técnico)
2. **Deconstruye** en componentes (ingeniería inversa)
3. **Planifica** con tareas jerárquicas
4. **Ejecuta** iterativamente de 0% a 100%
5. **Valida** visualmente (Playwright MCP)

## Fases de Ejecución

### 1. **DELIMITAR EL PROBLEMA DE NEGOCIO**
   - ¿Qué proceso está roto? (dolor)
   - ¿Cuánto cuesta hoy? (dinero/tiempo)
   - ¿Quién lo sufre? (rol específico)
   - ¿Qué significa "resuelto"? (KPI)

### 2. **INGENIERÍA INVERSA (Deconstrucción)**
   - ¿Qué componentes/partes tiene?
   - ¿Qué dependencias existen? (orden)
   - ¿Qué patrones del stack aplican?
   - ¿Qué casos edge considerar?

**Ejemplo SaaS Factory:**
```
Problema: "Generador de contratos para inmobiliarias"
↓ Ingeniería Inversa:
- Input: ¿Excel, formulario, API?
- Procesamiento: ¿Templates, variables, lógica?
- Output: ¿PDF, email, dashboard?
- Auth: ¿Email/Password (default)?
- Storage: ¿Supabase tables?
- UI: ¿Feature-First structure?
```

### 3. **PLANIFICACIÓN JERÁRQUICA (TodoWrite)**
   - Usar TodoWrite para estructura de tareas
   - Organizar en niveles (tareas → subtareas)
   - Dependencias cronológicas claras
   - Una tarea in_progress a la vez

**Estructura de Plan:**
```
├─ Feature: Autenticación
│  ├─ Setup Supabase Auth
│  ├─ Componentes Login/Register
│  └─ Middleware protección rutas
├─ Feature: Core Business Logic
│  ├─ Modelo de datos (Supabase)
│  ├─ UI componentes (shadcn/ui)
│  └─ Servicios (API routes)
└─ Validación Final
   ├─ Testing E2E
   └─ Deploy Vercel
```

### 4. **EJECUCIÓN ITERATIVA (0→100%)**

**Bucle de Ensamblaje:**
```
WHILE tareas pendientes:
  1. Marcar tarea como in_progress
  2. Ejecutar tarea
  3. Validar resultado (Playwright si es UI)
  4. IF error:
       - Analizar causa
       - Ajustar plan
       - Reintentar
     ELSE:
       - Marcar completed
       - Actualizar % progreso
  5. Siguiente tarea
```

**Principios de Ejecución:**
- Una tarea a la vez (no paralelismo prematuro)
- Validar ANTES de marcar completada
- Documentar decisiones importantes
- Refactorizar plan si aparecen nuevos requisitos

### 5. **VALIDACIÓN VISUAL (Playwright MCP)**
   - Después de cada componente UI: screenshot
   - Comparar vs diseño/expectativa
   - Iterar hasta pixel-perfect
   - Validar responsiveness (mobile/tablet/desktop)

### 6. **REPORTE DE ENTREGA**
   - Estado de todas las tareas
   - Problemas encontrados y soluciones
   - Deuda técnica (si aplica)
   - Próximos pasos recomendados

## Ejemplo Completo: SaaS de Cotizaciones

**Problema:** "Vendedores tardan 2 horas por cotización manual"

**Deconstrucción:**
```
- Input: Formulario con datos del cliente
- Lógica: Calcular precios según catálogo
- Output: PDF cotización + envío email
- Auth: Email/Password
- Storage: productos, cotizaciones, clientes
```

**Plan de Ensamblaje:**
```
✅ Setup proyecto Next.js + Supabase
   ✅ npx create-next-app
   ✅ Configurar Supabase client
   ✅ Variables de entorno
🔄 Feature: Autenticación
   ✅ Setup Supabase Auth
   🔄 Componentes Login/Register
   ⏳ Middleware rutas protegidas
⏳ Feature: Catálogo de Productos
   ⏳ Tabla products (Supabase)
   ⏳ CRUD productos
   ⏳ UI listado + edición
⏳ Feature: Generador Cotizaciones
   ⏳ Formulario nueva cotización
   ⏳ Lógica de cálculo
   ⏳ Generación PDF
   ⏳ Envío por email
⏳ Deploy & Testing
```

**Progreso:** 30% (3/10 tareas completadas)

## Cuándo Usar Esta Metodología

- Features nuevas end-to-end
- SaaS completos desde cero
- Refactorings grandes
- Debugging sistemático de bugs complejos
- **NO usar para:** Tareas simples de 1-2 pasos

## Ventajas del SaaS Factory

1. **Velocidad**: De idea a producción en minutos
2. **Calidad**: Validación en cada paso
3. **Visibilidad**: Progreso en tiempo real
4. **Recuperabilidad**: Si falla, sabes exactamente dónde
5. **Estandarización**: Mismo proceso, resultados consistentes

---

**Golden Path:** Next.js + Supabase + Tailwind + shadcn/ui + Playwright

*"La IA es el equipo de desarrollo. Tú eres el CEO que define la visión."*
