# 🏭 SaaS Factory V2 - Sistema de Templates

> *"La línea de ensamblaje de Ford aplicada al software."*

## 🎯 Qué es Este Proyecto

**SaaS Factory** es un sistema de comandos inteligentes para crear aplicaciones production-ready con Claude Code. Es un "factory" que genera proyectos completos en minutos.

**Filosofía V2:**
- **Henry Ford:** Un solo modelo "T" perfeccionado → Un solo stack
- **Elon Musk:** La máquina que construye la máquina → Los comandos que construyen el SaaS

## 📦 Estructura del Repositorio

```
saas-factory-v2/
├── CLAUDE.md                   # Este archivo (meta-docs del factory)
├── README.md                   # Guía de instalación para usuarios
├── CHANGELOG.md                # Historial de versiones
│
└── saas-factory/               # El Golden Path (proyecto funcional)
    ├── CLAUDE.md               # System prompt para proyectos
    ├── .mcp.json               # Configuración de MCPs
    ├── package.json            # Dependencias pre-instaladas
    ├── next.config.ts          # Next.js 16 con MCP activado
    ├── src/                    # Código fuente
    │   ├── app/                # Next.js App Router
    │   ├── features/           # Arquitectura Feature-First
    │   └── shared/             # Libs y componentes
    │
    └── .claude/
        ├── commands/           # Comandos slash
        │   ├── new-app.md      # 🏭 Arquitecto de Negocio
        │   ├── landing.md      # 🚀 Money Maker (landings)
        │   ├── explorador.md
        │   ├── ejecutar-prp.md
        │   ├── generar-prp.md
        │   └── ...
        ├── prompts/
        │   └── metodologia-saas-factory.md
        ├── agents/             # Agentes especializados
        ├── PRPs/               # Templates para features
        └── skills/             # Skills reutilizables
```

## 🚀 Cómo Funciona el Sistema

### El Alias `saas-factory`

```bash
alias saas-factory="cp -r [RUTA]/saas-factory/. ."
```

Copia **TODO el proyecto funcional** al directorio actual:
- `CLAUDE.md` → System prompt
- `.claude/` → Comandos, agentes, skills, PRPs
- `.mcp.json` → Configuración de MCPs (Next.js, Playwright, Supabase)
- `src/` → Código fuente con arquitectura Feature-First
- `package.json` → Dependencias (Next.js 16, React 19, Tailwind 3.4)
- `next.config.ts` → Con `experimental.mcpServer: true`
- Configs → TypeScript, ESLint, Tailwind

### El Golden Path (Stack Único)

| Capa | Tecnología |
|------|------------|
| Frontend | Next.js 16 + React 19 + TypeScript |
| Estilos | Tailwind CSS 3.4 + shadcn/ui |
| Auth | Supabase (Email/Password) |
| Database | Supabase (PostgreSQL) |
| Validación | Zod |
| State | Zustand |
| Testing | Playwright MCP |
| Deploy | Vercel |

**¿Por qué Email/Password y no OAuth?**
Para evitar bloqueos de bots durante testing. Google OAuth requiere verificación.

## 🛠️ Comandos Principales

### `/new-app` - El Arquitecto
Entrevista de negocio interactiva que genera `BUSINESS_LOGIC.md`.

**Flujo:**
1. Pregunta sobre el dolor del cliente
2. Define el flujo Happy Path
3. Identifica usuario, datos y KPIs
4. Genera especificación técnica

### `/landing` - The Money Maker
Genera landing pages de alta conversión.

**Flujo:**
1. Pregunta objetivo de conversión y vibe
2. Extrae psicología de ventas (dolor, FOMO, beneficio)
3. Diseña y ejecuta el código directamente
4. Valida con Playwright

## 🔧 Workflow de Instalación (Para Claude Code)

Cuando un usuario pide ayuda para configurar SaaS Factory:

### 1. Detectar Sistema
```bash
echo $SHELL  # zsh o bash
pwd          # Ruta del repo
```

### 2. Generar Alias
```bash
# Reemplazar [REPO_PATH] con pwd
alias saas-factory="cp -r [REPO_PATH]/saas-factory/. ."
```

### 3. Añadir a Shell Config
```bash
echo "alias saas-factory='...'" >> ~/.zshrc  # o ~/.bashrc
source ~/.zshrc
```

### 4. Validar
```bash
type saas-factory  # Debe retornar: "is an alias for..."
```

### 5. Explicar Uso
```
🎉 Configuración completa!

Para crear un nuevo proyecto:
1. mkdir mi-proyecto && cd mi-proyecto
2. saas-factory
3. claude .

Comandos disponibles:
- /new-app  → Define tu SaaS (genera BUSINESS_LOGIC.md)
- /landing  → Crea landing pages de alta conversión
```

## 📋 Metodología SaaS Factory

Ver `.claude/prompts/metodologia-saas-factory.md` para el proceso completo:

1. **Delimitar** problema de negocio
2. **Deconstruir** en componentes
3. **Planificar** con TodoWrite
4. **Ejecutar** iterativamente (0→100%)
5. **Validar** visualmente (Playwright)

## ❌ Restricciones

**Este repositorio NO debe:**
- Convertirse en un proyecto específico (es un factory)
- Tener código de aplicación en el root
- Committear `.mcp.json` con secrets (solo `example.mcp.json`)

**Los proyectos generados NO deben:**
- Usar OAuth para auth inicial (usar Email/Password)
- Añadir backends separados innecesariamente
- Sobre-engineerear la primera versión

## 🔄 Mantenimiento

**Actualizar cuando:**
- Nuevas versiones de Next.js
- Mejores prácticas de Supabase
- Nuevos MCPs disponibles
- Feedback de usuarios

## 📊 Estado V2

**Versión:** 2.0.0
**Última actualización:** 2024-12-04

**Completado:**
- ✅ Golden Path único (Next.js + Supabase)
- ✅ Comando `/new-app` (Arquitecto de Negocio)
- ✅ Comando `/landing` (Money Maker)
- ✅ Metodología SaaS Factory
- ✅ Alias `saas-factory`
- ✅ Documentación V2

**Eliminado (por diseño):**
- ❌ `python-claude-setup/` (innecesario)
- ❌ `auth-nextjs-template/` (auth inyectada por agente)
- ❌ `setup/` (el usuario usa el Golden Path)

---

*Este archivo es para que Claude Code entienda el repositorio SaaS Factory.*
*Para la metodología de desarrollo, ver `saas-factory/CLAUDE.md`.*
