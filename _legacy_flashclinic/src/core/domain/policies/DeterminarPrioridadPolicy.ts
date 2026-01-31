import { PrioridadCita } from "../entities/Cita";

export function determinarPrioridad(
  motivo: string,
  edad: number,
  tiempoEsperaDias: number
): PrioridadCita {
  const motivoLower = motivo.toLowerCase().trim();
  const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];

  let prioridad: PrioridadCita = "Baja";

  const tieneUrgencia = palabrasUrgencia.some((palabra) =>
    motivoLower.includes(palabra)
  );

  if (tieneUrgencia) {
    prioridad = "Alta";
  } else if (edad >= 65) {
    prioridad = "Media";
  }

  if (tiempoEsperaDias > 15) {
    if (prioridad === "Baja") {
      prioridad = "Media";
    } else if (prioridad === "Media") {
      prioridad = "Alta";
    }
  }

  return prioridad;
}
