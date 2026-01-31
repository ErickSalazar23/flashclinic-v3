# 🚀 Flash Clinic — Quick Start

Este proyecto sigue Clean Architecture.
No improvisar.

## 1. Qué es Flash Clinic
Sistema de coordinación de citas médicas.
NO es un chatbot.

## 2. Orden de trabajo (NO SALTARSE PASOS)

1. Dominio (src/core/domain)
   - Entidades
   - Policies
   - Eventos

2. Casos de uso (src/core/use-cases)
   - Orquestan reglas
   - No hablan con infraestructura

3. Puertos (src/core/ports)
   - Definen lo que el sistema necesita

4. Adapters (src/adapters)
   - WhatsApp
   - Web
   - Database

5. Infrastructure (src/infrastructure)
   - Supabase
   - n8n

## 3. Reglas de oro

- El Core NO conoce WhatsApp
- El Core NO conoce Supabase
- Los estados de cita son SOLO:
  Solicitud → Confirmada → Reprogramada → Cancelada → Atendida → NoAsistió

## 4. Antes de escribir código pregúntate

1. ¿Es dominio?
2. ¿Es decisión o ejecución?
3. ¿Estoy contaminando el core?

Si hay duda, detenerse.

## 5. Archivos clave

- `.cursorrules` → reglas para Cursor
- `.claude/FLASH_CLINIC_CORE.md` → biblia del sistema
- `src/` → software real
