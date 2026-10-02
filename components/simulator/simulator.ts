import type { Regime } from "@/lib/finance"
import type { Currency } from "@/lib/format"

export type Periodicity = "anual" | "semestral" | "cuatrimestral" | "trimestral" | "bimestral" | "mensual"
export type Operation = "inversion" | "credito"

export interface SharedConfig {
  regime: Regime
  periodicity: Periodicity
  currency: Currency
  operation: Operation
  rateKind: "nominal" | "efectiva"
  rateMode: "vencida" | "anticipada"
}

/** Meses que dura un periodo según la periodicidad elegida. */
export function effectiveMonthsPerPeriod(config: SharedConfig): number {
  // En interés continuo la convención del motor trabaja en años (12 meses).
  if (config.regime === "continuo") return 12
  switch (config.periodicity) {
    case "anual":
      return 12
    case "semestral":
      return 6
    case "cuatrimestral":
      return 4
    case "trimestral":
      return 3
    case "bimestral":
      return 2
    case "mensual":
      return 1
    default:
      return 12
  }
}

/** Nombre legible del periodo (singular / plural) para las etiquetas. */
export function periodUnitName(config: SharedConfig): { singular: string; plural: string } {
  if (config.regime === "continuo") return { singular: "año", plural: "años" }
  switch (config.periodicity) {
    case "anual":
      return { singular: "año", plural: "años" }
    case "semestral":
      return { singular: "semestre", plural: "semestres" }
    case "cuatrimestral":
      return { singular: "cuatrimestre", plural: "cuatrimestres" }
    case "trimestral":
      return { singular: "trimestre", plural: "trimestres" }
    case "bimestral":
      return { singular: "bimestre", plural: "bimestres" }
    case "mensual":
      return { singular: "mes", plural: "meses" }
    default:
      return { singular: "periodo", plural: "periodos" }
  }
}

export const PERIODICITY_OPTIONS: { value: Periodicity; label: string }[] = [
  { value: "anual", label: "Anual (12 meses)" },
  { value: "semestral", label: "Semestral (6 meses)" },
  { value: "cuatrimestral", label: "Cuatrimestral (4 meses)" },
  { value: "trimestral", label: "Trimestral (3 meses)" },
  { value: "bimestral", label: "Bimestral (2 meses)" },
  { value: "mensual", label: "Mensual (1 mes)" },
]
