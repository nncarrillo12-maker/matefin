"use client"

import { useMemo, useState } from "react"
import { ArrowRight, TrendingUp, CreditCard } from "lucide-react"
import { Field, TextInput, SelectInput } from "./ui"
import type { SharedConfig } from "./simulator"
import { effectiveMonthsPerPeriod, periodUnitName } from "./simulator"
import { solveSingle, type SingleUnknown, periodsToMonths } from "@/lib/finance"
import { parseNumber, formatMoney, formatPercent, formatNumber, formatYearsMonths } from "@/lib/format"

const UNKNOWNS: { value: SingleUnknown; label: string }[] = [
  { value: "VF", label: "Valor futuro (VF)" },
  { value: "VP", label: "Valor presente (VP)" },
  { value: "i", label: "Tasa de interés (i)" },
  { value: "n", label: "Tiempo (n)" },
]

export function SingleFlow({ config }: { config: SharedConfig }) {
  const [unknown, setUnknown] = useState<SingleUnknown>("VF")
  const [vp, setVp] = useState("")
  const [vf, setVf] = useState("")
  const [ratePct, setRatePct] = useState("")
  const [years, setYears] = useState("")
  const [months, setMonths] = useState("")

  const mpp = effectiveMonthsPerPeriod(config)
  const unitName = periodUnitName(config)
  const isContinuo = config.regime === "continuo"

  const result = useMemo(() => {
    const vpNum = parseNumber(vp)
    const vfNum = parseNumber(vf)
    const rate = parseNumber(ratePct) / 100
    const y = parseNumber(years) || 0
    const m = parseNumber(months) || 0
    const nPeriods = (y * 12 + m) / mpp

    return solveSingle({
      regime: config.regime,
      unknown,
      vp: Number.isFinite(vpNum) ? vpNum : undefined,
      vf: Number.isFinite(vfNum) ? vfNum : undefined,
      i: Number.isFinite(rate) ? rate : undefined,
      n: unknown === "n" ? undefined : (y > 0 || m > 0 ? nPeriods : undefined),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.regime, unknown, vp, vf, ratePct, years, months, mpp])

  const show = (u: SingleUnknown) => unknown !== u

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Entradas */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Datos de la operación</h2>

        <div className="mt-4 grid gap-4">
          <Field label="¿Qué quieres calcular? (incógnita)">
            <SelectInput value={unknown} onChange={(e) => setUnknown(e.target.value as SingleUnknown)}>
              {UNKNOWNS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          {show("VP") && (
            <Field label="Valor presente (VP)" hint={`Capital inicial en ${config.currency}`}>
              <TextInput inputMode="decimal" placeholder="Ej: 1.000.000" value={vp} onChange={(e) => setVp(e.target.value)} />
            </Field>
          )}

          {show("VF") && (
            <Field label="Valor futuro (VF)" hint={`Monto final en ${config.currency}`}>
              <TextInput inputMode="decimal" placeholder="Ej: 1.280.000" value={vf} onChange={(e) => setVf(e.target.value)} />
            </Field>
          )}

          {show("i") && (
            <Field
              label={`Tasa de interés (i) — % ${isContinuo ? "anual" : "por " + unitName.singular}`}
              hint={
                isContinuo
                  ? "En interés continuo la tasa es anual."
                  : "La tasa y el tiempo deben estar en la misma periodicidad."
              }
            >
              <TextInput inputMode="decimal" placeholder="Ej: 2,5" value={ratePct} onChange={(e) => setRatePct(e.target.value)} />
            </Field>
          )}

          {show("n") && (
            <Field
              label="Tiempo (n)"
              hint={
                isContinuo
                  ? "El tiempo se convierte a años (convención del interés continuo)."
                  : `Se convierte automáticamente a ${unitName.plural} (${mpp} ${mpp === 1 ? "mes" : "meses"} por periodo).`
              }
            >
              <div className="flex gap-2">
                <div className="flex-1">
                  <TextInput
                    inputMode="numeric"
                    placeholder="Años"
                    aria-label="Años"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                  />
                </div>
                <div className="flex-1">
                  <TextInput
                    inputMode="numeric"
                    placeholder="Meses"
                    aria-label="Meses"
                    value={months}
                    onChange={(e) => setMonths(e.target.value)}
                  />
                </div>
              </div>
            </Field>
          )}
        </div>
      </div>

      {/* Resultado */}
      <ResultPanel config={config} unknown={unknown} result={result} mpp={mpp} unitName={unitName} />
    </div>
  )
}

function ResultPanel({
  config,
  unknown,
  result,
  mpp,
  unitName,
}: {
  config: SharedConfig
  unknown: SingleUnknown
  result: ReturnType<typeof solveSingle>
  mpp: number
  unitName: { singular: string; plural: string }
}) {
  const isInversion = config.operation === "inversion"

  if (!result.ok) {
    return (
      <div className="flex flex-col justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-center">
        <p className="text-sm text-muted-foreground text-pretty">
          {result.error ?? "Ingresa los datos para ver el resultado."}
        </p>
      </div>
    )
  }

  const nMonths = periodsToMonths(result.n ?? 0, config.regime === "continuo" ? 12 : mpp)

  let mainValue = ""
  let mainLabel = ""
  if (unknown === "VF") {
    mainLabel = "Valor futuro (VF)"
    mainValue = formatMoney(result.vf ?? 0, config.currency)
  } else if (unknown === "VP") {
    mainLabel = "Valor presente (VP)"
    mainValue = formatMoney(result.vp ?? 0, config.currency)
  } else if (unknown === "i") {
    mainLabel = `Tasa de interés (i) — ${config.regime === "continuo" ? "anual" : "por " + unitName.singular}`
    mainValue = formatPercent(result.i ?? 0)
  } else {
    mainLabel = "Tiempo (n)"
    mainValue = formatYearsMonths(nMonths)
  }

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-6 ${
        isInversion ? "border-inversion/30 bg-inversion/5" : "border-credito/30 bg-credito/5"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
            isInversion
              ? "bg-inversion/15 text-inversion ring-1 ring-inversion/25"
              : "bg-credito/15 text-credito ring-1 ring-credito/25"
          }`}
        >
          {isInversion ? <TrendingUp className="h-3.5 w-3.5" /> : <CreditCard className="h-3.5 w-3.5" />}
          {isInversion ? "Inversión" : "Crédito"}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Interés {config.regime}
        </span>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">{mainLabel}</p>
      <p className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">{mainValue}</p>
      {unknown === "n" && (
        <p className="mt-1 text-sm text-muted-foreground">
          Equivale a {formatNumber(result.n ?? 0, 4)} {unitName.plural}
        </p>
      )}

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
        <Cell label="Valor presente (VP)" value={formatMoney(result.vp ?? 0, config.currency)} />
        <Cell label="Valor futuro (VF)" value={formatMoney(result.vf ?? 0, config.currency)} />
        <Cell
          label={`Tasa (${config.regime === "continuo" ? "anual" : "por " + unitName.singular})`}
          value={formatPercent(result.i ?? 0)}
        />
        <Cell label={`Tiempo (${unitName.plural})`} value={formatNumber(result.n ?? 0, 4)} />
      </dl>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-foreground px-4 py-3 text-background">
        <span className="text-sm font-medium">Ganancia neta (solo intereses)</span>
        <span className="font-display text-lg font-bold">
          {formatMoney(Math.abs(result.interes ?? 0), config.currency)}
        </span>
      </div>

      <p className="mt-4 flex items-start gap-2 text-sm leading-relaxed text-muted-foreground text-pretty">
        <ArrowRight className="mt-0.5 h-4 w-4 flex-none text-primary" aria-hidden="true" />
        {isInversion
          ? `Si inviertes ${formatMoney(result.vp ?? 0, config.currency)} obtendrás ${formatMoney(result.vf ?? 0, config.currency)}; tu ganancia por intereses es ${formatMoney(Math.abs(result.interes ?? 0), config.currency)}.`
          : `Si te prestan ${formatMoney(result.vp ?? 0, config.currency)} deberás pagar ${formatMoney(result.vf ?? 0, config.currency)}; el costo por intereses es ${formatMoney(Math.abs(result.interes ?? 0), config.currency)}.`}
      </p>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">{value}</dd>
    </div>
  )
}
