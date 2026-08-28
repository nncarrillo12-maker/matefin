"use client"

import { useState } from "react"
import { TrendingUp, CreditCard, Layers, Coins } from "lucide-react"
import { SingleFlow } from "./single-flow"
import { EquationOfValue } from "./equation-of-value"
import { Field, SelectInput, Segmented } from "./ui"
import {
  type SharedConfig,
  type Periodicity,
  type Operation,
  PERIODICITY_OPTIONS,
} from "./simulator"
import type { Regime } from "@/lib/finance"
import { CURRENCIES, type Currency } from "@/lib/format"

type Mode = "single" | "equation"

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

  const config: SharedConfig = { regime, periodicity, currency, operation }
  const isContinuo = regime === "continuo"
  const activeRegime = REGIMES.find((r) => r.value === regime)!

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

          <Field
            label="Periodicidad de la tasa"
            hint={
              isContinuo
                ? "En interés continuo la tasa se maneja de forma anual, por lo que la periodicidad no aplica."
                : "La tasa y el tiempo se expresan en esta unidad. La app convierte años y meses automáticamente."
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
      </div>

      {mode === "single" ? <SingleFlow config={config} /> : <EquationOfValue config={config} />}
    </div>
  )
}
