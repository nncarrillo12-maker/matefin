"use client"

import { useEffect, useState } from "react"
import { TrendingUp, CreditCard, Layers, Coins } from "lucide-react"
import { SingleFlow } from "./single-flow"
import { EquationOfValue } from "./equation-of-value"
import { AnnuityCalculator, RateConverter } from "./advanced-calculators"
import { Field, SelectInput, Segmented } from "./ui"
import {
  type SharedConfig,
  type Periodicity,
  type Operation,
  PERIODICITY_OPTIONS,
} from "./simulator"
import type { Regime } from "@/lib/finance"
import { CURRENCIES, type Currency } from "@/lib/format"

type Mode = "single" | "equation" | "tasas" | "anualidades"

const REGIMES: { value: Regime; label: string; blurb: string }[] = [
  { value: "simple", label: "Simple", blurb: "El interés se calcula siempre sobre el capital inicial." },
  { value: "compuesto", label: "Compuesto", blurb: "El interés se reinvierte: interés sobre interés." },
  { value: "continuo", label: "Continuo", blurb: "Capitalización instantánea con la función exponencial." },
]

export function SimulatorView() {
  const [mode, setMode] = useState<Mode>("single")
  const [regime, setRegime] = useState<Regime>("compuesto")
  const [periodicity, setPeriodicity] = useState<Periodicity>("anual")
  const [currency, setCurrency] = useState<Currency>("COP")
  const [operation, setOperation] = useState<Operation>("inversion")
  const [rateKind, setRateKind] = useState<"nominal" | "efectiva">("efectiva")
  const [rateMode, setRateMode] = useState<"vencida" | "anticipada">("vencida")

  const config: SharedConfig = { regime, periodicity, currency, operation, rateKind, rateMode }
  const isContinuo = regime === "continuo"
  const isCompuesto = regime === "compuesto"
  const activeRegime = REGIMES.find((r) => r.value === regime)!

  // Reset de seguridad: si el usuario está en una pestaña que solo aplica a "Compuesto"
  // y cambia a "Simple" o "Continuo", vuelve automáticamente a "Flujo único"
  useEffect(() => {
    if (!isCompuesto && (mode === "tasas" || mode === "anualidades")) {
      setMode("single")
    }
  }, [regime, mode, isCompuesto])

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Simulador</p>
        <h1 className="text-balance font-serif text-3xl md:text-4xl">
          Calculadora del valor del dinero en el tiempo
        </h1>
        <p className="max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Resuelve problemas de matemáticas financieras bajo interés simple, compuesto y continuo. Elige entre un flujo
          único (despeja VF, VP, tasa o tiempo) o una ecuación de valor con múltiples flujos referidos a una fecha
          focal.
        </p>
      </header>

      {/* Barra de configuración compartida */}
      <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
          <Layers className="h-4 w-4 text-primary" aria-hidden="true" /> Configuración general
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Régimen de interés" hint={activeRegime.blurb}>
            <Segmented
              ariaLabel="Régimen de interés"
              value={regime}
              onChange={setRegime}
              options={REGIMES.map((r) => ({ value: r.value, label: r.label }))}
            />
          </Field>

          <Field label="Tipo de operación" hint="Cambia la interpretación del resultado y el color de referencia.">
            <Segmented
              ariaLabel="Tipo de operación"
              value={operation}
              onChange={setOperation}
              options={[
                { value: "inversion", label: "Inversión" },
                { value: "credito", label: "Crédito" },
              ]}
            />
          </Field>

          {regime === "compuesto" && (
            <>
              <Field label="Tipo de tasa" hint="El compuesto convierte la tasa ingresada a efectiva vencida del periodo.">
                <SelectInput value={rateKind} onChange={(e) => setRateKind(e.target.value as "nominal" | "efectiva")}>
                  <option value="efectiva">Efectiva / periódica</option>
                  <option value="nominal">Nominal</option>
                </SelectInput>
              </Field>
              <Field label="Modalidad de la tasa" hint="Una tasa anticipada se convierte automáticamente antes de calcular.">
                <SelectInput value={rateMode} onChange={(e) => setRateMode(e.target.value as "vencida" | "anticipada")}>
                  <option value="vencida">Vencida</option>
                  <option value="anticipada">Anticipada</option>
                </SelectInput>
              </Field>
            </>
          )}

          <Field
            label="Periodicidad de la tasa"
            hint={
              isContinuo
                ? "En interés continuo la tasa se maneja de forma anual, por lo que la periodicidad no aplica."
                : regime === "compuesto"
                  ? "La tasa puede tener otra periodicidad; se convierte a efectiva mensual antes del cálculo."
                  : "La tasa y el tiempo deben expresarse en la misma unidad; no se convierten entre periodicidades."
            }
          >
            <SelectInput
              value={periodicity}
              disabled={isContinuo}
              onChange={(e) => setPeriodicity(e.target.value as Periodicity)}
            >
              {PERIODICITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </SelectInput>
          </Field>

          <Field label="Moneda" hint="Solo afecta el formato de presentación de los montos.">
            <SelectInput value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </SelectInput>
          </Field>
        </div>

        {operation === "credito" && (
          <p className="mt-4 rounded-lg border border-credito/20 bg-credito/5 px-3 py-2 text-xs text-muted-foreground">
            Herramienta construida con asistencia de inteligencia artificial Gemini.
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
            {operation === "inversion" ? (
              <TrendingUp className="h-3.5 w-3.5 text-inversion" />
            ) : (
              <CreditCard className="h-3.5 w-3.5 text-credito" />
            )}
            {operation === "inversion" ? "Modo inversión" : "Modo crédito"}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 font-medium text-secondary-foreground">
            <Coins className="h-3.5 w-3.5 text-primary" />
            Interés {regime}
          </span>
        </div>
      </section>

      {/* Selector de modo */}
      <div
        role="tablist"
        aria-label="Modo de simulación"
        className="inline-flex rounded-lg border border-border bg-card p-1"
      >
        <button
          role="tab"
          aria-selected={mode === "single"}
          onClick={() => setMode("single")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "single" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Flujo único
        </button>
        <button
          role="tab"
          aria-selected={mode === "equation"}
          onClick={() => setMode("equation")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "equation" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Ecuación de valor
        </button>
        {isCompuesto && (
          <>
            <button role="tab" aria-selected={mode === "tasas"} onClick={() => setMode("tasas")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === "tasas" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>Conversión de tasas</button>
            <button role="tab" aria-selected={mode === "anualidades"} onClick={() => setMode("anualidades")} className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${mode === "anualidades" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground"}`}>Anualidades</button>
          </>
        )}
      </div>

      {mode === "single" && <SingleFlow config={config} />}
      {mode === "equation" && <EquationOfValue config={config} />}
      {mode === "tasas" && <RateConverter />}
      {mode === "anualidades" && <AnnuityCalculator currency={currency} />}
    </div>
  )
}
