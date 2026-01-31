"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrioridadDecision = void 0;
const DeterminarPrioridadPolicy_1 = require("../../domain/policies/DeterminarPrioridadPolicy");
class PrioridadDecision {
    evaluar(contexto, peso) {
        const motivo = contexto.datos.motivo;
        const edad = contexto.datos.edad;
        const tiempoEsperaDias = contexto.datos.tiempoEsperaDias;
        if (typeof motivo !== "string" ||
            typeof edad !== "number" ||
            typeof tiempoEsperaDias !== "number") {
            return {
                opciones: [],
                tradeoffs: [],
                recomendacionPrincipal: null,
                requiereIntervencionHumana: true,
                razonIntervencion: "Datos incompletos o inválidos para determinar prioridad",
                autonomyLevel: "BLOCKED",
            };
        }
        const prioridadCalculada = (0, DeterminarPrioridadPolicy_1.determinarPrioridad)(motivo, edad, tiempoEsperaDias);
        if (peso === "LOW") {
            return this.evaluarLow(prioridadCalculada);
        }
        if (peso === "HIGH") {
            return this.evaluarHigh(motivo, edad, tiempoEsperaDias, prioridadCalculada);
        }
        return this.evaluarMedium(motivo, edad, tiempoEsperaDias, prioridadCalculada);
    }
    evaluarLow(prioridadCalculada) {
        const opcion = {
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
    evaluarMedium(motivo, edad, tiempoEsperaDias, prioridadCalculada) {
        const opciones = [
            {
                id: "alta",
                valor: "Alta",
                confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Alta"),
                razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Alta"),
            },
            {
                id: "media",
                valor: "Media",
                confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Media"),
                razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Media"),
            },
            {
                id: "baja",
                valor: "Baja",
                confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Baja"),
                razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Baja"),
            },
        ];
        const recomendacionPrincipal = opciones.find((op) => op.valor === prioridadCalculada) || opciones[0];
        const tradeoffs = opciones.map((opcion) => ({
            opcionId: opcion.id,
            ventajas: this.obtenerVentajas(opcion.valor),
            desventajas: this.obtenerDesventajas(opcion.valor),
        }));
        const requiereIntervencion = this.evaluarAmbiguidad(motivo, edad, tiempoEsperaDias);
        const autonomyLevel = this.calcularAutonomyLevel("MEDIUM", requiereIntervencion, motivo, edad, tiempoEsperaDias);
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
    evaluarHigh(motivo, edad, tiempoEsperaDias, prioridadCalculada) {
        const opciones = [
            {
                id: "alta",
                valor: "Alta",
                confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Alta"),
                razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Alta"),
            },
            {
                id: "media",
                valor: "Media",
                confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Media"),
                razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Media"),
            },
            {
                id: "baja",
                valor: "Baja",
                confianza: this.calcularConfianza(motivo, edad, tiempoEsperaDias, "Baja"),
                razones: this.obtenerRazones(motivo, edad, tiempoEsperaDias, "Baja"),
            },
        ];
        const recomendacionPrincipal = opciones.find((op) => op.valor === prioridadCalculada) || opciones[0];
        const tradeoffs = opciones.map((opcion) => ({
            opcionId: opcion.id,
            ventajas: this.obtenerVentajas(opcion.valor),
            desventajas: this.obtenerDesventajas(opcion.valor),
        }));
        const confianzaRecomendacion = recomendacionPrincipal.confianza;
        const requiereIntervencion = confianzaRecomendacion < 0.7 ||
            this.evaluarAmbiguidad(motivo, edad, tiempoEsperaDias);
        const autonomyLevel = this.calcularAutonomyLevel("HIGH", requiereIntervencion, motivo, edad, tiempoEsperaDias);
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
    calcularAutonomyLevel(peso, requiereIntervencion, motivo, edad, tiempoEsperaDias) {
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
    evaluarAmbiguedadExtrema(motivo, edad, tiempoEsperaDias) {
        const motivoLower = motivo.toLowerCase();
        const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];
        const tieneUrgencia = palabrasUrgencia.some((p) => motivoLower.includes(p));
        const indicadoresContradictorios = (tieneUrgencia && tiempoEsperaDias <= 5 && edad < 50) ||
            (!tieneUrgencia && tiempoEsperaDias > 20 && edad >= 70);
        const datosIncompletos = motivo.trim().length < 5 ||
            edad <= 0 ||
            tiempoEsperaDias < 0;
        return indicadoresContradictorios || datosIncompletos;
    }
    calcularConfianza(motivo, edad, tiempoEsperaDias, prioridad) {
        const motivoLower = motivo.toLowerCase();
        const palabrasUrgencia = ["dolor fuerte", "sangrado", "pecho"];
        if (prioridad === "Alta") {
            const tieneUrgencia = palabrasUrgencia.some((p) => motivoLower.includes(p));
            return tieneUrgencia ? 0.9 : 0.7;
        }
        if (prioridad === "Media") {
            if (edad >= 65)
                return 0.8;
            if (tiempoEsperaDias > 15)
                return 0.75;
            return 0.6;
        }
        return 0.7;
    }
    obtenerRazones(motivo, edad, tiempoEsperaDias, prioridad) {
        const razones = [];
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
    obtenerVentajas(prioridad) {
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
    obtenerDesventajas(prioridad) {
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
    evaluarAmbiguidad(motivo, edad, tiempoEsperaDias) {
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
exports.PrioridadDecision = PrioridadDecision;
