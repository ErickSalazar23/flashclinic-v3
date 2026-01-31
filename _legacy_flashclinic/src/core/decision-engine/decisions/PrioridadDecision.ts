import { DecisionContext } from "../DecisionContext";
import { DecisionResult, Tradeoff } from "../DecisionResult";
import { DecisionOption } from "../DecisionOption";
import { DecisionWeight } from "../DecisionWeight";
import { AutonomyLevel } from "../AutonomyLevel";
import { PrioridadCita } from "../../domain/entities/Cita";
import { determinarPrioridad } from "../../domain/policies/DeterminarPrioridadPolicy";

export class PrioridadDecision {
  evaluar(contexto: DecisionContext, peso: DecisionWeight): DecisionResult {
    const motivo = contexto.datos.motivo as string;
    const edad = contexto.datos.edad as number;
    const tiempoEsperaDias = contexto.datos.tiempoEsperaDias as number;

    if (
      typeof motivo !== "string" ||
      typeof edad !== "number" ||
      typeof tiempoEsperaDias !== "number"
    ) {
      return {
        opciones: [],
        tradeoffs: [],
        recomendacionPrincipal: null,
        requiereIntervencionHumana: true,
        razonIntervencion: "Datos incompletos o inválidos para determinar prioridad",
        autonomyLevel: "BLOCKED",
      };
    }

    const prioridadCalculada = determinarPrioridad(motivo, edad, tiempoEsperaDias);

    if (peso === "LOW") {
      return this.evaluarLow(prioridadCalculada);
    }

    if (peso === "HIGH") {
      return this.evaluarHigh(motivo, edad, tiempoEsperaDias, prioridadCalculada);
    }

    return this.evaluarMedium(motivo, edad, tiempoEsperaDias, prioridadCalculada);
  }

  private evaluarLow(prioridadCalculada: PrioridadCita): DecisionResult {
    const opcion: DecisionOption = {
      id: prioridadCalculada.toLowerCase(),
      valor: prioridadCalculada,
      confianza: 0.9,
      razones: ["Decisión simple basada en reglas estándar"],
    };

    return {
      opciones: [opcion],
      tradeoffs: [],
      recomendacionPrincipal: opcion,
      requiereIntervencionHumana: false,
      autonomyLevel: "AUTOMATIC",
    };
  }

  private evaluarMedium(
    motivo: string,
    edad: number,
    tiempoEsperaDias: number,
    prioridadCalculada: PrioridadCita
  ): DecisionResult {
    const opciones: DecisionOption[] = [
      {
        id: "alta",
        valor: "Alta" as PrioridadCita,
        confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Alta"),
        razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Alta"),
      },
      {
        id: "media",
        valor: "Media" as PrioridadCita,
        confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Media"),
        razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Media"),
      },
      {
        id: "baja",
        valor: "Baja" as PrioridadCita,
        confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Baja"),
        razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Baja"),
      },
    ];

    const recomendacionPrincipal = opciones.find(
      (op) => op.valor === prioridadCalculada
    ) || opciones[0];

    const tradeoffs: Tradeoff[] = opciones.map((opcion) => ({
      opcionId: opcion.id,
      ventajas: this.obtenerVentajas(opcion.valor as PrioridadCita),
      desventajas: this.obtenerDesventajas(opcion.valor as PrioridadCita),
    }));

    const requiereIntervencion = this.evaluarAmbiguidad(
      motivo,
      edad,
      tiempoEsperaDias
    );

    const autonomyLevel = this.calcularAutonomyLevel(
      "MEDIUM",
      requiereIntervencion,
      motivo,
      edad,
      tiempoEsperaDias
    );

    return {
      opciones,
      tradeoffs,
      recomendacionPrincipal,
      requiereIntervencionHumana: requiereIntervencion,
      razonIntervencion: requiereIntervencion
        ? "Escenario ambiguo que requiere revisión clínica"
        : undefined,
      autonomyLevel,
    };
  }

  private evaluarHigh(
    motivo: string,
    edad: number,
    tiempoEsperaDias: number,
    prioridadCalculada: PrioridadCita
  ): DecisionResult {
    const opciones: DecisionOption[] = [
      {
        id: "alta",
        valor: "Alta" as PrioridadCita,
        confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Alta"),
        razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Alta"),
      },
      {
        id: "media",
        valor: "Media" as PrioridadCita,
        confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Media"),
        razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Media"),
      },
      {
        id: "baja",
        valor: "Baja" as PrioridadCita,
        confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Baja"),
        razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Baja"),
      },
    ];

    const recomendacionPrincipal = opciones.find(
      (op) => op.valor === prioridadCalculada
    ) || opciones[0];

    const tradeoffs: Tradeoff[] = opciones.map((opcion) => ({
      opcionId: opcion.id,
      ventajas: this.obtenerVentajas(opcion.valor as PrioridadCita),
      desventajas: this.obtenerDesventajas(opcion.valor as PrioridadCita),
    }));

    const confianzaRecomendacion = recomendacionPrincipal.confianza;
    const requiereIntervencion =
      confianzaRecomendacion < 0.7 ||
      this.evaluarAmbiguidad(motivo, edad, tiempoEsperaDias);

    const autonomyLevel = this.calcularAutonomyLevel(
      "HIGH",
      requiereIntervencion,
      motivo,
      edad,
      tiempoEsperaDias
    );

    return {
      opciones,
      tradeoffs,
      recomendacionPrincipal,
      requiereIntervencionHumana: requiereIntervencion,
      razonIntervencion: requiereIntervencion
        ? confianzaRecomendacion < 0.7
          ? "Confianza baja en la recomendación principal"
          : "Escenario ambiguo que requiere revisión clínica"
        : undefined,
      autonomyLevel,
    };
  }

  private calcularAutonomyLevel(
    peso: DecisionWeight,
    requiereIntervencion: boolean,
    motivo: string,
    edad: number,
    tiempoEsperaDias: number
  ): AutonomyLevel {
    if (peso === "LOW") {
      return "AUTOMATIC";
    }

    if (this.evaluarAmbiguedadExtrema(motivo, edad, tiempoEsperaDias)) {
      return "BLOCKED";
    }

    if (peso === "HIGH" && requiereIntervencion) {
      return "SUPERVISED";
    }

    return "AUTOMATIC";
  }

  private evaluarAmbiguedadExtrema(
    motivo: string,
    edad: number,
    tiempoEsperaDias: number
  ): boolean {
    const motivoLower = motivo.toLowerCase();
    const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];
    const tieneUrgencia = palabrasUrgencia.some((p) => motivoLower.includes(p));

    const indicadoresContradictorios =
      (tieneUrgencia && tiempoEsperaDias <= 5 && edad < 50) ||
      (!tieneUrgencia && tiempoEsperaDias > 20 && edad >= 70);

    const datosIncompletos =
      motivo.trim().length < 5 ||
      edad <= 0 ||
      tiempoEsperaDias < 0;

    return indicadoresContradictorios || datosIncompletos;
  }

  private calcularConfianza(
    motivo: string,
    edad: number,
    tiempoEsperaDias: number,
    prioridad: PrioridadCita
  ): number {
    const motivoLower = motivo.toLowerCase();
    const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];

    if (prioridad === "Alta") {
      const tieneUrgencia = palabrasUrgencia.some((p) => motivoLower.includes(p));
      return tieneUrgencia ? 0.9 : 0.7;
    }

    if (prioridad === "Media") {
      if (edad >= 65) return 0.8;
      if (tiempoEsperaDias > 15) return 0.75;
      return 0.6;
    }

    return 0.7;
  }

  private obtenerRazones(
    motivo: string,
    edad: number,
    tiempoEsperaDias: number,
    prioridad: PrioridadCita
  ): string[] {
    const razones: string[] = [];
    const motivoLower = motivo.toLowerCase();
    const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];

    if (prioridad === "Alta") {
      if (palabrasUrgencia.some((p) => motivoLower.includes(p))) {
        razones.push("Motivo contiene indicadores de urgencia");
      }
      if (tiempoEsperaDias > 15) {
        razones.push("Tiempo de espera prolongado");
      }
    }

    if (prioridad === "Media") {
      if (edad >= 65) {
        razones.push("Paciente de edad avanzada");
      }
      if (tiempoEsperaDias > 15) {
        razones.push("Tiempo de espera prolongado");
      }
    }

    if (prioridad === "Baja") {
      razones.push("No se detectaron indicadores de urgencia");
      razones.push("Tiempo de espera dentro de parámetros normales");
    }

    return razones;
  }

  private obtenerVentajas(prioridad: PrioridadCita): string[] {
    switch (prioridad) {
      case "Alta":
        return [
          "Atención rápida para casos urgentes",
          "Reduce riesgo de complicaciones",
        ];
      case "Media":
        return [
          "Balance entre urgencia y recursos",
          "Adecuado para pacientes de riesgo moderado",
        ];
      case "Baja":
        return [
          "Optimiza uso de recursos",
          "Permite planificación eficiente",
        ];
    }
  }

  private obtenerDesventajas(prioridad: PrioridadCita): string[] {
    switch (prioridad) {
      case "Alta":
        return [
          "Mayor demanda de recursos",
          "Puede desplazar otros casos",
        ];
      case "Media":
        return [
          "Puede requerir seguimiento adicional",
          "Balance delicado entre urgencia y recursos",
        ];
      case "Baja":
        return [
          "Riesgo de subestimar urgencia",
          "Puede generar espera prolongada",
        ];
    }
  }

  private evaluarAmbiguidad(
    motivo: string,
    edad: number,
    tiempoEsperaDias: number
  ): boolean {
    const motivoLower = motivo.toLowerCase();
    const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];
    const tieneUrgencia = palabrasUrgencia.some((p) => motivoLower.includes(p));

    if (tieneUrgencia && tiempoEsperaDias > 15) {
      return false;
    }

    if (!tieneUrgencia && edad < 65 && tiempoEsperaDias <= 15) {
      return false;
    }

    if (tieneUrgencia && edad >= 65 && tiempoEsperaDias <= 7) {
      return false;
    }

    return true;
  }
}
