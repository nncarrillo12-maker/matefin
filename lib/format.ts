// Formato numérico colombiano: punto para miles y coma para decimales.

export type Currency = "COP" | "EUR" | "USD"

export const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
  { value: "COP", label: "Peso colombiano (COP)", symbol: "$" },
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "Dólar estadounidense (USD)", symbol: "US$" },
]

export function currencySymbol(currency: Currency): string {
  return CURRENCIES.find((c) => c.value === currency)?.symbol ?? "$"
}

/**
 * Formatea un número con el estándar colombiano:
 * punto como separador de miles y coma como separador decimal.
 */
export function formatNumber(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—"
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Formatea un monto como moneda con el símbolo correspondiente.
 * Ej: $ 1.250.000,00
 */
export function formatMoney(value: number, currency: Currency, decimals = 2): string {
  if (!Number.isFinite(value)) return "—"
  return `${currencySymbol(currency)} ${formatNumber(value, decimals)}`
}

/**
 * Formatea una tasa (fracción decimal) como porcentaje colombiano.
 * Ej: 0,025 -> "2,5000 %"
 */
export function formatPercent(fraction: number, decimals = 4): string {
  if (!Number.isFinite(fraction)) return "—"
  return `${formatNumber(fraction * 100, decimals)} %`
}

/**
 * Convierte un texto ingresado por el usuario (que puede venir en formato
 * colombiano "1.250.000,50" o en formato simple "1250000.50") a número.
 */
export function parseNumber(input: string): number {
  if (input === null || input === undefined) return Number.NaN
  const raw = String(input).trim()
  if (raw === "") return Number.NaN

  const hasComma = raw.includes(",")
  const dotCount = (raw.match(/\./g) || []).length

  let normalized = raw
  if (hasComma) {
    // Formato colombiano completo: el punto es miles, la coma es decimal.
    // Ej: "1.000.000,50" -> "1000000.50"
    normalized = raw.replace(/\./g, "").replace(",", ".")
  } else if (dotCount > 1) {
    // Varios puntos y sin coma -> todos son separadores de miles.
    // Ej: "1.000.000" -> "1000000"
    normalized = raw.replace(/\./g, "")
  } else if (dotCount === 1) {
    // Un solo punto: puede ser miles ("1.000") o decimal ("1.5").
    // Convención: si tras el punto hay exactamente 3 dígitos, es separador de miles.
    const [, decimals = ""] = raw.split(".")
    if (/^\d{3}$/.test(decimals)) {
      normalized = raw.replace(".", "")
    }
    // En cualquier otro caso se interpreta como decimal (tal cual).
  }
  const n = Number(normalized.replace(/\s/g, ""))
  return n
}

/**
 * Convierte un número de meses total a una expresión legible "X años y Y meses".
 */
export function formatYearsMonths(totalMonths: number): string {
  if (!Number.isFinite(totalMonths)) return "—"
  const rounded = Math.round(totalMonths * 100) / 100
  const years = Math.floor(rounded / 12)
  const months = rounded - years * 12
  const monthsRounded = Math.round(months * 100) / 100

  const parts: string[] = []
  if (years > 0) parts.push(`${years} ${years === 1 ? "año" : "años"}`)
  if (monthsRounded > 0 || years === 0) {
    parts.push(`${formatNumber(monthsRounded, monthsRounded % 1 === 0 ? 0 : 2)} ${monthsRounded === 1 ? "mes" : "meses"}`)
  }
  return parts.join(" y ")
}
