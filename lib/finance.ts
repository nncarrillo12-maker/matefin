// ============================================================================
// Motor de matemáticas financieras — Primer Corte
// Interés simple, compuesto y continuo. Valor del dinero en el tiempo.
// Ecuaciones de valor con varios flujos, coeficientes e incógnitas.
// ============================================================================

export type Regime = "simple" | "compuesto" | "continuo"

export type Periodicity =
  | "mensual"
  | "bimestral"
  | "trimestral"
  | "cuatrimestral"
  | "semestral"
  | "anual"
  | "personalizado" // "cada N meses"

export type OperationType = "credito" | "inversion"

// Meses que dura un periodo según la periodicidad de la tasa.
export function periodMonths(periodicity: Periodicity, customMonths = 1): number {
  switch (periodicity) {
    case "mensual":
      return 1
    case "bimestral":
      return 2
    case "trimestral":
      return 3
    case "cuatrimestral":
      return 4
    case "semestral":
      return 6
    case "anual":
      return 12
    case "personalizado":
      return customMonths
  }
}

export const PERIODICITY_LABELS: Record<Periodicity, string> = {
  mensual: "Mensual (1 mes)",
  bimestral: "Bimestral (2 meses)",
  trimestral: "Trimestral (3 meses)",
  cuatrimestral: "Cuatrimestral (4 meses)",
  semestral: "Semestral (6 meses)",
  anual: "Anual (12 meses)",
  personalizado: "Cada N meses (personalizado)",
}

// Nombre del periodo en singular/plural, útil para mostrar "n" con unidad.
export function periodName(periodicity: Periodicity, plural: boolean, customMonths = 1): string {
  const map: Record<Periodicity, [string, string]> = {
    mensual: ["mes", "meses"],
    bimestral: ["bimestre", "bimestres"],
    trimestral: ["trimestre", "trimestres"],
    cuatrimestral: ["cuatrimestre", "cuatrimestres"],
    semestral: ["semestre", "semestres"],
    anual: ["año", "años"],
    personalizado: [`periodo de ${customMonths} meses`, `periodos de ${customMonths} meses`],
  }
  return plural ? map[periodicity][1] : map[periodicity][0]
}

/**
 * Convierte un tiempo en años y meses al número de periodos de la tasa.
 * Para interés continuo el tiempo se cuenta SIEMPRE en años (convención del curso),
 * por lo tanto periodMonthsForTime debe ser 12 en ese caso.
 */
export function periodsFromYearsMonths(years: number, months: number, monthsPerPeriod: number): number {
  const totalMonths = years * 12 + months
  return totalMonths / monthsPerPeriod
}

// Número de periodos -> total de meses.
export function periodsToMonths(periods: number, monthsPerPeriod: number): number {
  return periods * monthsPerPeriod
}

// ============================================================================
// Movimiento de un flujo en el tiempo (valor del dinero en el tiempo)
// ============================================================================

/**
 * Lleva un monto ubicado en el periodo `from` hasta el periodo `to`,
 * bajo el régimen y tasa (por periodo) indicados.
 * - dt > 0: se capitaliza (llevar hacia el futuro)
 * - dt < 0: se descuenta (traer al presente)
 *
 * En interés simple el traslado hacia el pasado se hace dividiendo,
 * porque el interés simple no es reversible con la misma fórmula.
 */
export function moveAmount(amount: number, from: number, to: number, regime: Regime, i: number): number {
  const dt = to - from
  switch (regime) {
    case "simple":
      if (dt >= 0) return amount * (1 + i * dt)
      return amount / (1 + i * -dt)
    case "compuesto":
      return amount * Math.pow(1 + i, dt)
    case "continuo":
      return amount * Math.exp(i * dt)
  }
}

// ============================================================================
// Cálculo de una sola operación (VP <-> VF con incógnita seleccionable)
// ============================================================================

export type SingleUnknown = "VF" | "VP" | "i" | "n"

export interface SingleInput {
  regime: Regime
  unknown: SingleUnknown
  vp?: number
  vf?: number
  i?: number // tasa por periodo, en fracción decimal
  n?: number // número de periodos
}

export interface SingleResult {
  ok: boolean
  error?: string
  value?: number // el valor de la incógnita
  vp?: number
  vf?: number
  i?: number
  n?: number
  interes?: number // ganancia neta = VF - VP
}

export function solveSingle(input: SingleInput): SingleResult {
  const { regime, unknown } = input
  const vp = input.vp
  const vf = input.vf
  const i = input.i
  const n = input.n

  try {
    if (vp != null && (!Number.isFinite(vp) || vp <= 0)) return { ok: false, error: "El VP debe ser mayor que cero." }
    if (vf != null && (!Number.isFinite(vf) || vf <= 0)) return { ok: false, error: "El VF debe ser mayor que cero." }
    if (i != null && (!Number.isFinite(i) || i < 0)) return { ok: false, error: "La tasa no puede ser negativa." }
    if (n != null && (!Number.isFinite(n) || n <= 0)) return { ok: false, error: "El periodo debe ser mayor que cero." }

    if (unknown === "VF") {
      if (vp == null || i == null || n == null) return { ok: false, error: "Faltan datos: VP, i y n." }
      const result = moveAmount(vp, 0, n, regime, i)
      return finalizeSingle(vp, result, i, n, result)
    }

    if (unknown === "VP") {
      if (vf == null || i == null || n == null) return { ok: false, error: "Faltan datos: VF, i y n." }
      const result = moveAmount(vf, n, 0, regime, i)
      return finalizeSingle(result, vf, i, n, result)
    }

    if (unknown === "i") {
      if (vp == null || vf == null || n == null) return { ok: false, error: "Faltan datos: VP, VF y n." }
      if (vp <= 0) return { ok: false, error: "El VP debe ser mayor que cero." }
      if (n === 0) return { ok: false, error: "El tiempo no puede ser cero." }
      let rate: number
      if (regime === "simple") {
        rate = (vf / vp - 1) / n
      } else if (regime === "compuesto") {
        rate = Math.pow(vf / vp, 1 / n) - 1
      } else {
        if (vf <= 0) return { ok: false, error: "El VF debe ser mayor que cero." }
        rate = Math.log(vf / vp) / n
      }
      return finalizeSingle(vp, vf, rate, n, rate)
    }

    // unknown === "n"
    if (vp == null || vf == null || i == null) return { ok: false, error: "Faltan datos: VP, VF e i." }
    if (vp <= 0) return { ok: false, error: "El VP debe ser mayor que cero." }
    if (i === 0) return { ok: false, error: "La tasa no puede ser cero." }
    let periods: number
    if (regime === "simple") {
      periods = (vf / vp - 1) / i
    } else if (regime === "compuesto") {
      periods = Math.log(vf / vp) / Math.log(1 + i)
    } else {
      if (vf <= 0) return { ok: false, error: "El VF debe ser mayor que cero." }
      periods = Math.log(vf / vp) / i
    }
    return finalizeSingle(vp, vf, i, periods, periods)
  } catch (e) {
    return { ok: false, error: "No se pudo resolver la operación." }
  }
}

function finalizeSingle(vp: number, vf: number, i: number, n: number, value: number): SingleResult {
  if (!Number.isFinite(value)) return { ok: false, error: "El resultado no es un número válido. Revisa los datos." }
  return {
    ok: true,
    value,
    vp,
    vf,
    i,
    n,
    interes: vf - vp,
  }
}

// ============================================================================
// Ecuación de valor — varios flujos en momentos distintos
// ============================================================================

export interface Flow {
  id: string
  label: string
  // Lado de la ecuación: los flujos del grupo A se igualan a los del grupo B.
  side: "A" | "B"
  // Momento del flujo, expresado en periodos de la tasa.
  time: number
  // Si el flujo es conocido: su monto. Si es incógnita: se usa coefficient.
  isUnknownAmount?: boolean
  amount?: number
  // Coeficiente que multiplica a la incógnita de monto (X).
  // Ej: "el primer desembolso fue 1,4 veces el segundo" -> coefficient = 1,4.
  coefficient?: number
  // Marca el flujo cuyo momento (tiempo) es la incógnita.
  isUnknownTime?: boolean
}

export type EqUnknown = "monto" | "i" | "tiempo"

export interface EqInput {
  regime: Regime
  flows: Flow[]
  focal: number // fecha focal, en periodos
  unknown: EqUnknown
  // Cuando la incógnita es la tasa: valor de i conocido no aplica.
  // Cuando la incógnita es monto o tiempo, la tasa i es conocida:
  i?: number
}

export interface EqResult {
  ok: boolean
  error?: string
  value?: number // valor de la incógnita (monto, tasa o tiempo en periodos)
  totalA?: number // valor nominal (sin trasladar) del grupo A
  totalB?: number
}

// Valor de todos los flujos llevados a la fecha focal, con signo por lado.
// A suma positivo, B suma negativo -> residual = A - B en la focal.
function residualAtFocal(flows: Flow[], focal: number, regime: Regime, i: number, xValue: number, tValue: number): number {
  let sum = 0
  for (const f of flows) {
    const amount = f.isUnknownAmount ? (f.coefficient ?? 1) * xValue : (f.amount ?? 0)
    const time = f.isUnknownTime ? tValue : f.time
    const moved = moveAmount(amount, time, focal, regime, i)
    sum += f.side === "A" ? moved : -moved
  }
  return sum
}

function bisection(fn: (x: number) => number, lo: number, hi: number, tol = 1e-10, maxIter = 200): number | null {
  let a = lo
  let b = hi
  let fa = fn(a)
  let fb = fn(b)
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return null
  if (fa === 0) return a
  if (fb === 0) return b
  if (fa * fb > 0) return null
  for (let k = 0; k < maxIter; k++) {
    const m = (a + b) / 2
    const fm = fn(m)
    if (!Number.isFinite(fm)) return null
    if (Math.abs(fm) < tol || (b - a) / 2 < tol) return m
    if (fa * fm < 0) {
      b = m
      fb = fm
    } else {
      a = m
      fa = fm
    }
  }
  return (a + b) / 2
}

// Busca un cambio de signo dentro de un rango y resuelve por bisección.
function findRoot(fn: (x: number) => number, lo: number, hi: number, steps = 400): number | null {
  const first = bisectionScan(fn, lo, hi, steps)
  return first
}

function bisectionScan(fn: (x: number) => number, lo: number, hi: number, steps: number): number | null {
  const dx = (hi - lo) / steps
  let prevX = lo
  let prevY = fn(lo)
  for (let k = 1; k <= steps; k++) {
    const x = lo + k * dx
    const y = fn(x)
    if (Number.isFinite(prevY) && Number.isFinite(y) && prevY * y <= 0 && prevY !== 0) {
      const root = bisection(fn, prevX, x)
      if (root != null) return root
    }
    prevX = x
    prevY = y
  }
  return null
}

export function solveEquationOfValue(input: EqInput): EqResult {
  const { regime, flows, focal, unknown } = input

  if (flows.length < 2) {
    return { ok: false, error: "Agrega al menos dos flujos para plantear la ecuación de valor." }
  }

  const nominalA = flows.filter((f) => f.side === "A").reduce((s, f) => s + (f.isUnknownAmount ? 0 : f.amount ?? 0), 0)
  const nominalB = flows.filter((f) => f.side === "B").reduce((s, f) => s + (f.isUnknownAmount ? 0 : f.amount ?? 0), 0)

  try {
    if (unknown === "monto") {
      const i = input.i
      if (i == null) return { ok: false, error: "Ingresa la tasa de interés i." }
      const unknownFlows = flows.filter((f) => f.isUnknownAmount)
      if (unknownFlows.length === 0) return { ok: false, error: "Marca al menos un flujo como incógnita de monto." }

      // La ecuación es lineal en X: residual(X) = residual(0) + X * (residual(1) - residual(0))
      const r0 = residualAtFocal(flows, focal, regime, i, 0, 0)
      const r1 = residualAtFocal(flows, focal, regime, i, 1, 0)
      const slope = r1 - r0
      if (Math.abs(slope) < 1e-15) return { ok: false, error: "La incógnita de monto no afecta la ecuación." }
      const x = -r0 / slope
      if (!Number.isFinite(x)) return { ok: false, error: "No se pudo resolver el monto." }
      return { ok: true, value: x, totalA: nominalA, totalB: nominalB }
    }

    if (unknown === "i") {
      const fn = (rate: number) => residualAtFocal(flows, focal, regime, rate, 0, 0)
      // Rango razonable de tasa por periodo: -0,99 a 10 (1000%).
      const root = findRoot(fn, -0.9999, 10, 600)
      if (root == null) return { ok: false, error: "No se encontró una tasa que satisfaga la ecuación en el rango buscado." }
      return { ok: true, value: root, totalA: nominalA, totalB: nominalB }
    }

    // unknown === "tiempo"
    const i = input.i
    if (i == null) return { ok: false, error: "Ingresa la tasa de interés i." }
    const tFlow = flows.find((f) => f.isUnknownTime)
    if (!tFlow) return { ok: false, error: "Marca el flujo cuyo momento es la incógnita." }
    const fn = (t: number) => residualAtFocal(flows, focal, regime, i, 0, t)
    const root = findRoot(fn, 0, 600, 600)
    if (root == null) return { ok: false, error: "No se encontró un momento que satisfaga la ecuación en el rango buscado." }
    return { ok: true, value: root, totalA: nominalA, totalB: nominalB }
  } catch (e) {
    return { ok: false, error: "No se pudo resolver la ecuación de valor." }
  }
}
