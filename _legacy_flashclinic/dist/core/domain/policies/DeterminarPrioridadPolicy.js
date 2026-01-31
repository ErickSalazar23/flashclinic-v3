"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.determinarPrioridad = determinarPrioridad;
function determinarPrioridad(motivo, edad, tiempoEsperaDias) {
    const motivoLower = motivo.toLowerCase().trim();
    const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];
    let prioridad = "Baja";
    const tieneUrgencia = palabrasUrgencia.some((palabra) => motivoLower.includes(palabra));
    if (tieneUrgencia) {
        prioridad = "Alta";
    }
    else if (edad >= 65) {
        prioridad = "Media";
    }
    if (tiempoEsperaDias > 15) {
        if (prioridad === "Baja") {
            prioridad = "Media";
        }
        else if (prioridad === "Media") {
            prioridad = "Alta";
        }
    }
    return prioridad;
}
