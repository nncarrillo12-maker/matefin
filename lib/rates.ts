export type RateKind = "nominal" | "efectiva"
export type RateMode = "vencida" | "anticipada"
export type RatePeriod = "diaria" | "semanal" | "quincenal" | "mensual" | "bimestral" | "trimestral" | "cuatrimestral" | "quintimestral" | "semestral" | "anual" | "custom"

export const RATE_PERIODS: { value: RatePeriod; label: string; periodsPerYear: number }[] = [
  { value: "diaria", label: "Diaria (365 días)", periodsPerYear: 365 }, { value: "semanal", label: "Semanal (52 semanas)", periodsPerYear: 52 },
  { value: "quincenal", label: "Quincenal", periodsPerYear: 24 }, { value: "mensual", label: "Mensual", periodsPerYear: 12 },
  { value: "bimestral", label: "Bimestral", periodsPerYear: 6 }, { value: "trimestral", label: "Trimestral", periodsPerYear: 4 },
  { value: "cuatrimestral", label: "Cuatrimestral", periodsPerYear: 3 }, { value: "quintimestral", label: "Quintimestral", periodsPerYear: 12 / 5 },
  { value: "semestral", label: "Semestral", periodsPerYear: 2 }, { value: "anual", label: "Anual", periodsPerYear: 1 },
  { value: "custom", label: "Cada N meses", periodsPerYear: 1 },
]

export function periodsPerYear(period: RatePeriod, customMonths = 1) {
  return period === "custom" ? 12 / Math.max(1, customMonths) : RATE_PERIODS.find((p) => p.value === period)?.periodsPerYear ?? 12
}

export function toEffectiveAnnual(rate: number, kind: RateKind, mode: RateMode, period: RatePeriod, customMonths = 1) {
  const n = periodsPerYear(period, customMonths)
  if (rate < 0 || rate >= 1 && mode === "anticipada") throw new Error("La tasa debe ser positiva y la anticipada menor que 100%.")
  const periodic = kind === "nominal" ? rate / n : rate
  const vencida = mode === "anticipada" ? periodic / (1 - periodic) : periodic
  return Math.pow(1 + vencida, n) - 1
}

export function convertRate(input: { rate: number; kind: RateKind; mode: RateMode; period: RatePeriod; customMonths?: number }, output: { kind: RateKind; mode: RateMode; period: RatePeriod; customMonths?: number }) {
  const ea = toEffectiveAnnual(input.rate, input.kind, input.mode, input.period, input.customMonths)
  const n = periodsPerYear(output.period, output.customMonths)
  const effectivePeriodic = Math.pow(1 + ea, 1 / n) - 1
  const periodic = output.mode === "anticipada" ? effectivePeriodic / (1 + effectivePeriodic) : effectivePeriodic
  return output.kind === "nominal" ? periodic * n : periodic
}

export function annuityFuture(payment: number, rate: number, count: number, due = false) {
  if (rate === 0) return payment * count
  return payment * ((Math.pow(1 + rate, count) - 1) / rate) * (due ? 1 + rate : 1)
}

export function annuityPresent(payment: number, rate: number, count: number, due = false) {
  if (rate === 0) return payment * count
  return payment * ((1 - Math.pow(1 + rate, -count)) / rate) * (due ? 1 + rate : 1)
}

export function annuityPaymentFromFuture(future: number, rate: number, count: number, due = false) {
  return future / (annuityFuture(1, rate, count, due) || 1)
}

export function annuityPaymentFromPresent(present: number, rate: number, count: number, due = false) {
  return present / (annuityPresent(1, rate, count, due) || 1)
}
