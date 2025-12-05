# 🏭 SaaS Factory V2 - De Idea a Producción en Minutos

> *"La línea de ensamblaje de Ford aplicada al software."*

Sistema de comandos inteligentes para construir aplicaciones **production-ready** con IA.

## 🎯 ¿Qué es SaaS Factory?

**Un solo comando. Todo listo.**

```bash
cd ~/mi-nuevo-proyecto
saas-factory
```

La IA ya sabe cómo trabajar. Tú solo describes lo que quieres construir.

---

## 🚀 Quick Start (2 minutos)

### Paso 1: Clona el repositorio

```bash
git clone https://github.com/daniel-carreon/saas-factory-setup.git
cd saas-factory-setup
```

### Paso 2: Abre en Claude Code

```bash
claude .
```

### Paso 3: Pídele que configure el alias

```
Configura el alias "saas-factory" en mi terminal
```

Claude Code detectará tu sistema y configurará todo automáticamente.

---

## 🛠️ Comandos Disponibles

Una vez configurado, estos comandos están disponibles en cualquier proyecto:

### `/new-app` - El Arquitecto
Entrevista de negocio para definir tu SaaS B2B.

```
/new-app
```

El agente actúa como **Consultor de Negocio Senior**:
- Extrae el dolor del cliente
- Define el flujo principal (Happy Path)
- Identifica usuarios y datos
- Genera `BUSINESS_LOGIC.md` con especificación técnica

### `/landing` - The Money Maker
Genera landing pages de alta conversión.

```
/landing
```

El agente actúa como **Copywriter y Diseñador de Clase Mundial**:
- Entrevista sobre objetivo y vibe
- Escribe copy persuasivo (AIDA/PAS)
- Diseña y ejecuta el código directamente
- Valida con Playwright

---

## 📦 ¿Qué Incluye?

Cuando ejecutas `saas-factory` en un proyecto, obtienes:

```
tu-proyecto/
├── CLAUDE.md              # System prompt - La IA lee esto automáticamente
├── .mcp.json              # Configuración de herramientas IA
│
└── .claude/
    ├── commands/          # Comandos slash (/new-app, /landing, etc.)
    ├── prompts/           # Metodología SaaS Factory
    ├── agents/            # Agentes especializados
    ├── PRPs/              # Templates para features complejas
    └── skills/            # Skills reutilizables
```

---

## 🏗️ El Golden Path

**Un solo stack. Sin decisiones innecesarias.**

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 15 + TypeScript |
| Estilos | Tailwind CSS + shadcn/ui |
| Auth | Supabase (Email/Password) |
| Database | Supabase (PostgreSQL) |
| Validación | Zod |
| State | Zustand |
| Testing | Playwright |
| Deploy | Vercel |

**¿Por qué este stack?**
- Probado en producción
- Excelente DX (Developer Experience)
- La IA lo entiende perfectamente
- Deploy en 1 click

---

## 🔧 Configuración Manual del Alias

Si prefieres configurar manualmente:

### Para zsh (~/.zshrc):

```bash
# SaaS Factory - De idea a producción en minutos
alias saas-factory="cp [RUTA]/CLAUDE.md . && cp -r [RUTA]/.claude . && cp [RUTA]/.mcp.json ."
```

### Para bash (~/.bashrc):

```bash
# SaaS Factory - De idea a producción en minutos
alias saas-factory="cp [RUTA]/CLAUDE.md . && cp -r [RUTA]/.claude . && cp [RUTA]/.mcp.json ."
```

**Nota:** Reemplaza `[RUTA]` con la ruta absoluta donde clonaste este repositorio.

Después ejecuta:
```bash
source ~/.zshrc  # o ~/.bashrc
```

---

## 📋 Workflow Típico

### 1. Crear nuevo proyecto

```bash
mkdir mi-saas && cd mi-saas
saas-factory
claude .
```

### 2. Definir el negocio

```
/new-app
```

Responde las preguntas del Consultor de Negocio. Genera `BUSINESS_LOGIC.md`.

### 3. Construir

```
Implementa las features según BUSINESS_LOGIC.md
```

La IA sigue la metodología SaaS Factory automáticamente.

### 4. Crear landing (opcional)

```
/landing
```

Para cada cliente o producto que necesite landing page.

---

## 🎨 Filosofía

### Henry Ford
> "Pueden tener el coche del color que quieran, siempre que sea negro."

**Un solo stack perfeccionado** en lugar de mil opciones que paralizan.

### Elon Musk
> "La máquina que construye la máquina es más importante que la máquina."

**Los comandos que construyen el SaaS** son más importantes que el SaaS mismo.

---

## ❓ FAQ

**¿Por qué solo Next.js?**
Porque hace el 100% del trabajo. No necesitas Python ni backends separados para el 90% de los SaaS B2B.

**¿Y si necesito backend complejo?**
Next.js API Routes + Supabase Edge Functions cubren casi todo. Si realmente necesitas más, siempre puedes añadir después.

**¿Por qué Email/Password en lugar de Google OAuth?**
Para evitar bloqueos de bots durante testing. Google OAuth requiere verificación que complica el desarrollo.

**¿Puedo modificar los templates?**
Sí. Todo está diseñado para ser personalizado. El `CLAUDE.md` es tu punto de entrada.

---

## 🤝 Contribuir

¿Ideas para mejorar SaaS Factory?

1. Abre un issue con tu propuesta
2. Fork y PR son bienvenidos
3. Mantén la filosofía: **simplicidad radical**

---

## 📖 Documentación Adicional

- `.claude/prompts/metodologia-saas-factory.md` - La metodología completa
- `.claude/commands/new-app.md` - Cómo funciona el arquitecto
- `.claude/commands/landing.md` - Cómo funciona el generador de landings

---

**SaaS Factory V2** | *"De la idea a producción en minutos, no en meses."*

```
        ┌─────────────────────────────────────┐
        │                                     │
        │   saas-factory  →  /new-app  →  🚀  │
        │                                     │
        └─────────────────────────────────────┘
```
