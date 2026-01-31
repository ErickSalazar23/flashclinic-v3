# FLASH CLINIC — LEYES DE HIERRO DEL DOMINIO

## Ley 1 — Inmutabilidad Temporal

### Principio Fundamental

El pasado del sistema **no se edita**. El pasado solo puede ser **interpretado** mediante nuevos eventos.

Flash Clinic es un sistema clínico. Por lo tanto, su dominio se rige por principios de **auditabilidad**, **trazabilidad** y **responsabilidad temporal**. Ninguna acción futura puede alterar un hecho pasado.

---

### Invariantes Absolutas

Las siguientes reglas no pueden ser violadas por:

* Código
* Administradores
* Integraciones externas
* Automatizaciones
* Inteligencia artificial

#### 1. Identidad de la Cita

* Cada Cita posee un identificador único.
* El identificador se genera una sola vez.
* El identificador nunca cambia.
* El identificador no se reutiliza ni se corrige.

La identidad es permanente. Una Cita es la misma entidad durante toda su existencia lógica.

---

#### 2. Momento de Creación

* Cada Cita tiene un instante exacto de creación.
* Este instante representa el momento en que el sistema aceptó la solicitud.
* La fecha y hora de creación son inmutables.
* No dependen del cliente ni del canal de entrada.

El tiempo es una propiedad del sistema, no del usuario.

---

#### 3. Estados como Historia, no como Campo

* El estado de una Cita no se sobrescribe.
* Cada cambio de estado genera un nuevo registro histórico.
* El historial completo de estados es inmutable.

Una Cita puede haber estado en múltiples estados a lo largo del tiempo. Ninguno se elimina.

El “estado actual” es una **proyección**, no una fuente de verdad.

---

#### 4. Eventos como Fuente de Verdad

* Todo hecho relevante del dominio se representa como un evento.
* Los eventos son inmutables.
* Los eventos describen lo que ocurrió, no lo que debería haber ocurrido.

El sistema confía en los eventos para:

* Auditoría
* Reconstrucción de estado
* Análisis histórico
* Explicabilidad de decisiones

---

### Consecuencia Arquitectónica

Flash Clinic no es un sistema de mutaciones, es un sistema de **evolución temporal**.

Cualquier componente que requiera modificar el pasado está conceptualmente equivocado y debe ser rediseñado.

---

### Alcance de la Ley

Esta ley gobierna:

* Casos de uso actuales y futuros
* Persistencia de datos
* Integraciones externas
* Decisiones asistidas por IA
* Reportes y analítica

No existe excepción.

---

### Nota Final

Esta ley existe para proteger al sistema de la improvisación humana y de la sobre-optimización algorítmica.

Sin inmutabilidad, no hay criterio.
Sin criterio, no hay sistema.
# FLASH CLINIC — LEYES DE HIERRO DEL DOMINIO

## Ley 1 — Inmutabilidad Temporal

### Principio Fundamental

El pasado del sistema **no se edita**. El pasado solo puede ser **interpretado** mediante nuevos eventos.

Flash Clinic es un sistema clínico. Por lo tanto, su dominio se rige por principios de **auditabilidad**, **trazabilidad** y **responsabilidad temporal**. Ninguna acción futura puede alterar un hecho pasado.

---

### Invariantes Absolutas

Las siguientes reglas no pueden ser violadas por:

* Código
* Administradores
* Integraciones externas
* Automatizaciones
* Inteligencia artificial

#### 1. Identidad de la Cita

* Cada Cita posee un identificador único.
* El identificador se genera una sola vez.
* El identificador nunca cambia.
* El identificador no se reutiliza ni se corrige.

La identidad es permanente. Una Cita es la misma entidad durante toda su existencia lógica.

---

#### 2. Momento de Creación

* Cada Cita tiene un instante exacto de creación.
* Este instante representa el momento en que el sistema aceptó la solicitud.
* La fecha y hora de creación son inmutables.
* No dependen del cliente ni del canal de entrada.

El tiempo es una propiedad del sistema, no del usuario.

---

#### 3. Estados como Historia, no como Campo

* El estado de una Cita no se sobrescribe.
* Cada cambio de estado genera un nuevo registro histórico.
* El historial completo de estados es inmutable.

Una Cita puede haber estado en múltiples estados a lo largo del tiempo. Ninguno se elimina.

El “estado actual” es una **proyección**, no una fuente de verdad.

---

#### 4. Eventos como Fuente de Verdad

* Todo hecho relevante del dominio se representa como un evento.
* Los eventos son inmutables.
* Los eventos describen lo que ocurrió, no lo que debería haber ocurrido.

El sistema confía en los eventos para:

* Auditoría
* Reconstrucción de estado
* Análisis histórico
* Explicabilidad de decisiones

---

### Consecuencia Arquitectónica

Flash Clinic no es un sistema de mutaciones, es un sistema de **evolución temporal**.

Cualquier componente que requiera modificar el pasado está conceptualmente equivocado y debe ser rediseñado.

---

### Alcance de la Ley

Esta ley gobierna:

* Casos de uso actuales y futuros
* Persistencia de datos
* Integraciones externas
* Decisiones asistidas por IA
* Reportes y analítica

No existe excepción.

---

### Nota Final

Esta ley existe para proteger al sistema de la improvisación humana y de la sobre-optimización algorítmica.

Sin inmutabilidad, no hay criterio.
Sin criterio, no hay sistema.

---

## Ley 2 — Prioridad Clínica como Decisión Derivada y Auditada

### Principio Fundamental

La prioridad de una Cita **no es una opinión**, es una **derivación del sistema** basada en información clínica y contexto temporal.

La Inteligencia Artificial propone. El criterio clínico humano puede intervenir. El sistema **recuerda ambas cosas**.

---

### Invariantes

#### 1. Prioridad Automática

* Toda Cita debe tener una prioridad calculada automáticamente al momento de su creación.
* La prioridad automática se deriva de reglas y políticas del dominio.
* La prioridad automática **no depende** de intervención humana.

Esta prioridad representa la mejor decisión posible según la información disponible en el instante de la solicitud.

---

#### 2. Intervención Humana Controlada

* Solo un rol clínico autorizado puede modificar la prioridad.
* La modificación **no elimina** la prioridad automática.
* La modificación genera un nuevo evento del dominio.

El sistema distingue explícitamente entre:

* PrioridadDerivadaPorSistema
* PrioridadSobrescritaPorHumano

---

#### 3. Justificación Obligatoria

* Toda sobrescritura humana de la prioridad requiere una justificación en lenguaje natural.
* La justificación queda registrada de forma inmutable.

No existe cambio silencioso.

---

#### 4. Trazabilidad Completa

* El sistema conserva el historial completo de prioridades.
* Es posible reconstruir:

  * la prioridad original
  * quién la modificó
  * cuándo se modificó
  * por qué se modificó

---

### Consecuencia Arquitectónica

La prioridad **no es un campo mutable**.

Es una secuencia de decisiones en el tiempo.

Cualquier diseño que permita editar directamente la prioridad sin generar eventos viola esta ley.

---

### Alcance de la Ley

Esta ley gobierna:

* Policies de priorización
* Casos de uso clínicos
* Interfaces administrativas
* Decisiones asistidas por IA
* Auditoría y explicabilidad

---

### Nota Final

La IA optimiza. El humano responde. El sistema recuerda.

Sin memoria de la decisión, no hay criterio clínico.
Sin criterio clínico, no hay sistema.
