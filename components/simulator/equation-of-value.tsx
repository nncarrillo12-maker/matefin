"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Info, TrendingUp, CreditCard } from "lucide-react"
import { Field, TextInput, SelectInput, Segmented } from "./ui"
import type { SharedConfig } from "./simulator"
import { effectiveMonthsPerPeriod, periodUnitName } from "./simulator"
import { solveEquationOfValue, type EqUnknown, type Flow, periodsToMonths } from "@/lib/finance"
import { parseNumber, formatMoney, formatPercent, formatNumber, formatYearsMonths } from "@/lib/format"

interface UIFlow {
  id: string
  label: string
  side: "A" | "B"
  years: string
  months: string
  isUnknownAmount: boolean
  amount: string
  coefficient: string
  isUnknownTime: boolean
}

let counter = 0
const uid = () => `flow-${++counter}`

function makeFlow(partial: Partial<UIFlow> = {}): UIFlow {
  return {
    id: uid(),
    label: "Flujo",
    side: "A",
    years: "",
    months: "",
    isUnknownAmount: false,
    amount: "",
    coefficient: "1",
    isUnknownTime: false,
    ...partial,
  }
}

const UNKNOWNS: { value: EqUnknown; label: string }[] = [
  { value: "monto", label: "Valor de un flujo" },
  { value: "i", label: "Tasa de interés" },
  { value: "tiempo", label: "Momento de un flujo" },
]

export function EquationOfValue({ config }: { config: SharedConfig }) {
  const [unknown, setUnknown] = useState<EqUnknown>("monto")
  const [ratePct, setRatePct] = useState("")
  const [focalYears, setFocalYears] = useState("0")
  const [focalMonths, setFocalMonths] = useState("0")
  const [flows, setFlows] = useState<UIFlow[]>(() => [
    makeFlow({ label: "Préstamo recibido", side: "A", years: "0", months: "0", amount: "5.000.000" }),
    makeFlow({ label: "Pago 1", side: "B", years: "0", months: "6", isUnknownAmount: true, coefficient: "1" }),
    makeFlow({ label: "Pago 2", side: "B", years: "1", months: "0", isUnknownAmount: true, coefficient: "1" }),
  ])

  const mpp = effectiveMonthsPerPeriod(config)
  const unitName = periodUnitName(config)

  const updateFlow = (id: string, patch: Partial<UIFlow>) =>
    setFlows((fs) => fs.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  const removeFlow = (id: string) => setFlows((fs) => fs.filter((f) => f.id !== id))
  const addFlow = () => setFlows((fs) => [...fs, makeFlow({ label: `Flujo ${fs.length + 1}` })])

  const result = useMemo(() => {
    const focalPeriods = ((parseNumber(focalYears) || 0) * 12 + (parseNumber(focalMonths) || 0)) / mpp
    const rate = parseNumber(ratePct) / 100

    const engineFlows: Flow[] = flows.map((f) => {
      const time = ((parseNumber(f.years) || 0) * 12 + (parseNumber(f.months) || 0)) / mpp
      const isUnknownAmount = unknown === "monto" && f.isUnknownAmount
      const isUnknownTime = unknown === "tiempo" && f.isUnknownTime
      return {
        id: f.id,
        label: f.label,
        side: f.side,
        time,
        isUnknownAmount,
        amount: isUnknownAmount ? undefined : parseNumber(f.amount) || 0,
        coefficient: parseNumber(f.coefficient) || 1,
        isUnknownTime,
      }
    })

    return solveEquationOfValue({
      regime: config.regime,
      flows: engineFlows,
      focal: focalPeriods,
      unknown,
      i: unknown === "i" ? undefined : Number.isFinite(rate) ? rate : undefined,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.regime, flows, focalYears, focalMonths, ratePct, unknown, mpp])

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="font-display text-lg font-bold">Ecuación de valor</h2>
        <p className="mt-1 text-sm text-muted-foreground text-pretty">
          La herramienta lleva todos los flujos a la fecha focal e iguala el <strong>Grupo A</strong> con el{" "}
          <strong>Grupo B</strong>. Úsalo para créditos e inversiones con varios pagos o desembolsos.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="¿Qué quieres calcular? (incógnita)">
            <SelectInput value={unknown} onChange={(e) => setUnknown(e.target.value as EqUnknown)}>
              {UNKNOWNS.map((u) => (
                <option key={u.value} value={u.value}>
                  {u.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          {unknown !== "i" && (
            <Field
              label={`Tasa de interés (i) — % ${config.regime === "continuo" ? "anual" : "por " + unitName.singular}`}
            >
              <TextInput inputMode="decimal" placeholder="Ej: 2,5" value={ratePct} onChange={(e) => setRatePct(e.target.value)} />
            </Field>
          )}
        </div>

        <Field
          label="Fecha focal"
          className="mt-4"
          hint="Momento al que se trasladan todos los flujos. En interés compuesto y continuo el resultado no cambia con la focal; en interés simple sí."
        >
          <div className="flex gap-2">
            <TextInput inputMode="numeric" placeholder="Años" aria-label="Años de la fecha focal" value={focalYears} onChange={(e) => setFocalYears(e.target.value)} />
            <TextInput inputMode="numeric" placeholder="Meses" aria-label="Meses de la fecha focal" value={focalMonths} onChange={(e) => setFocalMonths(e.target.value)} />
          </div>
        </Field>

        <div className="mt-6 flex items-center justify-between">
          <h3 className="font-display text-sm font-bold">Flujos de dinero</h3>
          <button
            type="button"
            onClick={addFlow}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary/60"
          >
            <Plus className="h-3.5 w-3.5" /> Agregar flujo
          </button>
        </div>

        <div className="mt-3 grid gap-3">
          {flows.map((f) => (
            <FlowEditor
              key={f.id}
              flow={f}
              unknown={unknown}
              config={config}
              unitName={unitName}
              onChange={(patch) => updateFlow(f.id, patch)}
              onRemove={() => removeFlow(f.id)}
              canRemove={flows.length > 2}
            />
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-4 w-4 flex-none text-primary" aria-hidden="true" />
          <p className="text-pretty">
            El coeficiente sirve para enunciados como &ldquo;el primer pago fue 1,4 veces el segundo&rdquo;: marca ambos
            como incógnita y pon 1,4 en uno y 1 en el otro.
          </p>
        </div>
      </div>

      <EqResultPanel config={config} unknown={unknown} result={result} mpp={mpp} unitName={unitName} />
    </div>
  )
}

function FlowEditor({
  flow,
  unknown,
  config,
  unitName,
  onChange,
  onRemove,
  canRemove,
}: {
  flow: UIFlow
  unknown: EqUnknown
  config: SharedConfig
  unitName: { singular: string; plural: string }
  onChange: (patch: Partial<UIFlow>) => void
  onRemove: () => void
  canRemove: boolean
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2">
        <TextInput
          aria-label="Nombre del flujo"
          value={flow.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="flex-1 py-1.5 text-sm font-medium"
        />
        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Eliminar flujo"
          className="flex h-8 w-8 flex-none items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
        <Field label="Grupo">
          <Segmented
            ariaLabel="Grupo del flujo"
            value={flow.side}
            onChange={(v) => onChange({ side: v })}
            options={[
              { value: "A", label: "Grupo A" },
              { value: "B", label: "Grupo B" },
            ]}
          />
        </Field>

        <Field label={`Momento (${unitName.singular === "año" ? "años y meses" : "años y meses"})`}>
          {unknown === "tiempo" && flow.isUnknownTime ? (
            <div className="flex h-full items-center rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 text-sm font-medium text-primary">
              Momento a calcular
            </div>
          ) : (
            <div className="flex gap-2">
              <TextInput inputMode="numeric" placeholder="Años" aria-label="Años" value={flow.years} onChange={(e) => onChange({ years: e.target.value })} />
              <TextInput inputMode="numeric" placeholder="Meses" aria-label="Meses" value={flow.months} onChange={(e) => onChange({ months: e.target.value })} />
            </div>
          )}
        </Field>
      </div>

      {/* Monto o incógnita */}
      {unknown === "monto" ? (
        <div className="mt-2.5">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1.5 text-xs font-medium">
              <input
                type="checkbox"
                checked={flow.isUnknownAmount}
                onChange={(e) => onChange({ isUnknownAmount: e.target.checked })}
                className="h-4 w-4 accent-primary"
              />
              Este flujo es la incógnita (X)
            </label>
          </div>
          {flow.isUnknownAmount ? (
            <Field label="Coeficiente (veces X)" className="mt-2" hint="Cuántas veces X vale este flujo. Usa 1 si es exactamente X.">
              <TextInput inputMode="decimal" value={flow.coefficient} onChange={(e) => onChange({ coefficient: e.target.value })} />
            </Field>
          ) : (
            <Field label={`Monto (${config.currency})`} className="mt-2">
              <TextInput inputMode="decimal" placeholder="Ej: 5.000.000" value={flow.amount} onChange={(e) => onChange({ amount: e.target.value })} />
            </Field>
          )}
        </div>
      ) : unknown === "tiempo" ? (
        <div className="mt-2.5 grid gap-2.5 sm:grid-cols-2">
          <label className="flex items-center gap-1.5 text-xs font-medium">
            <input
              type="checkbox"
              checked={flow.isUnknownTime}
              onChange={(e) => onChange({ isUnknownTime: e.target.checked })}
              className="h-4 w-4 accent-primary"
            />
            Calcular el momento de este flujo
          </label>
          <Field label={`Monto (${config.currency})`}>
            <TextInput inputMode="decimal" placeholder="Ej: 5.000.000" value={flow.amount} onChange={(e) => onChange({ amount: e.target.value })} />
          </Field>
        </div>
      ) : (
        <Field label={`Monto (${config.currency})`} className="mt-2.5">
          <TextInput inputMode="decimal" placeholder="Ej: 5.000.000" value={flow.amount} onChange={(e) => onChange({ amount: e.target.value })} />
        </Field>
      )}
    </div>
  )
}

function EqResultPanel({
  config,
  unknown,
  result,
  mpp,
  unitName,
}: {
  config: SharedConfig
  unknown: EqUnknown
  result: ReturnType<typeof solveEquationOfValue>
  mpp: number
  unitName: { singular: string; plural: string }
}) {
  const isInversion = config.operation === "inversion"

  if (!result.ok) {
    return (
      <div className="flex flex-col justify-center rounded-2xl border border-dashed border-border bg-secondary/30 p-6 text-center">
        <p className="text-sm text-muted-foreground text-pretty">{result.error ?? "Completa los flujos."}</p>
      </div>
    )
  }

  let mainLabel = ""
  let mainValue = ""
  let sub = ""
  if (unknown === "monto") {
    mainLabel = "Valor del flujo incógnita (X)"
    mainValue = formatMoney(result.value ?? 0, config.currency)
  } else if (unknown === "i") {
    mainLabel = `Tasa de interés (i) — ${config.regime === "continuo" ? "anual" : "por " + unitName.singular}`
    mainValue = formatPercent(result.value ?? 0)
  } else {
    const nMonths = periodsToMonths(result.value ?? 0, config.regime === "continuo" ? 12 : mpp)
    mainLabel = "Momento del flujo"
    mainValue = formatYearsMonths(nMonths)
    sub = `Equivale a ${formatNumber(result.value ?? 0, 4)} ${unitName.plural}`
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
      {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}

      <dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border">
        <div className="bg-card p-3">
          <dt className="text-xs text-muted-foreground">Total nominal Grupo A</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">
            {formatMoney(result.totalA ?? 0, config.currency)}
          </dd>
        </div>
        <div className="bg-card p-3">
          <dt className="text-xs text-muted-foreground">Total nominal Grupo B</dt>
          <dd className="mt-0.5 font-mono text-sm font-semibold text-foreground">
            {formatMoney(result.totalB ?? 0, config.currency)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-pretty">
        Este es el valor que hace que, en la fecha focal, el Grupo A y el Grupo B tengan exactamente el mismo valor. Los
        totales nominales no incluyen el traslado en el tiempo; son solo la suma de los montos conocidos.
      </p>
    </div>
  )
}
