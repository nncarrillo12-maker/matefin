"use client"

import { useMemo, useState } from "react"
import { ArrowRightLeft, Calculator, Plus, Trash2 } from "lucide-react"
import { annuityFuture, annuityPaymentFromPresent, annuityPresent, convertRate, RATE_PERIODS, type RateKind, type RateMode, type RatePeriod } from "@/lib/rates"
import { formatMoney } from "@/lib/format"
import { Field, SelectInput } from "./ui"

const inputClass = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
type RateConfig = { kind: RateKind; mode: RateMode; period: RatePeriod; customMonths: number }

function RateFields({ prefix, value, setValue }: { prefix: string; value: RateConfig; setValue: (value: RateConfig) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">
    <Field label={`${prefix}: tipo`}><SelectInput value={value.kind} onChange={(e) => setValue({ ...value, kind: e.target.value as RateKind })}><option value="efectiva">Efectiva / periódica</option><option value="nominal">Nominal</option></SelectInput></Field>
    <Field label={`${prefix}: modalidad`}><SelectInput value={value.mode} onChange={(e) => setValue({ ...value, mode: e.target.value as RateMode })}><option value="vencida">Vencida</option><option value="anticipada">Anticipada</option></SelectInput></Field>
    <Field label={`${prefix}: capitalización`}><SelectInput value={value.period} onChange={(e) => setValue({ ...value, period: e.target.value as RatePeriod })}>{RATE_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</SelectInput></Field>
    {value.period === "custom" && <Field label="Cada cuántos meses"><input className={inputClass} type="number" min="0.01" step="0.01" value={value.customMonths || ""} onChange={(e) => setValue({ ...value, customMonths: Number(e.target.value) })} /></Field>}
  </div>
}

export function RateConverter() {
  const [rate, setRate] = useState("24")
  const [from, setFrom] = useState<RateConfig>({ kind: "nominal", mode: "vencida", period: "mensual", customMonths: 1 })
  const [to, setTo] = useState<RateConfig>({ kind: "efectiva", mode: "vencida", period: "anual", customMonths: 1 })
  const numericRate = Number(rate)
  const invalidCustomPeriod = [from, to].find((config) => config.period === "custom" && (!Number.isFinite(config.customMonths) || config.customMonths <= 0))
  const error = rate === "" ? "Ingresa una tasa." : !Number.isFinite(numericRate) || numericRate < 0 ? "La tasa no puede ser negativa." : invalidCustomPeriod ? "Los meses de capitalización deben ser mayores que cero." : null
  const result = useMemo(() => {
    if (error) return null
    try { return convertRate({ ...from, rate: numericRate / 100 }, to) * 100 } catch { return null }
  }, [error, from, numericRate, to])
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-accent" aria-hidden="true" /><div><h2 className="font-display text-lg font-bold">Conversión de tasas</h2><p className="text-sm text-muted-foreground">Convierte cualquier tasa equivalente. Convención: 365 días y 52 semanas.</p></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto_1fr]"><div className="space-y-3"><Field label="Tasa de entrada (%)" data-invalid={Boolean(error)}><input className={inputClass} aria-invalid={Boolean(error)} type="number" min="0" step="0.01" value={rate} onChange={(e) => setRate(e.target.value)} />{error && <p className="text-sm text-destructive">{error}</p>}</Field><RateFields prefix="Entrada" value={from} setValue={setFrom} /></div><div className="hidden items-center justify-center lg:flex"><ArrowRightLeft className="h-5 w-5 text-muted-foreground" aria-hidden="true" /></div><div><RateFields prefix="Salida" value={to} setValue={setTo} /><div className="mt-5 rounded-xl bg-accent/10 p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Resultado equivalente</p><p className="mt-1 font-serif text-3xl text-accent">{result == null ? "—" : `${result.toLocaleString("es-CO", { maximumFractionDigits: 6 })}%`}</p></div></div></div></section>
}

type Extra = { id: number; amount: string; period: string }
type Unknown = "VP" | "VF" | "A"

export function AnnuityCalculator({ currency }: { currency: "COP" | "USD" | "EUR" }) {
  const [due, setDue] = useState(false); const [unknown, setUnknown] = useState<Unknown>("VP"); const [payment, setPayment] = useState("100000"); const [target, setTarget] = useState("1000000"); const [rate, setRate] = useState("2"); const [count, setCount] = useState("12"); const [extra, setExtra] = useState<Extra[]>([])
  const i = Number(rate) / 100; const n = Number(count); const a = Number(payment); const targetValue = Number(target)
  const invalid = rate !== "" && (i < 0 || !Number.isFinite(i)) ? "La tasa no puede ser negativa." : n <= 0 ? "El número de periodos debe ser mayor que cero." : null
  const baseVp = annuityPresent(a, i, n, due); const baseVf = annuityFuture(a, i, n, due)
  const extrasPresent = extra.reduce((sum, item) => sum + Number(item.amount || 0) / Math.pow(1 + i, Number(item.period || 0)), 0)
  const extrasFuture = extra.reduce((sum, item) => sum + Number(item.amount || 0) * Math.pow(1 + i, n - Number(item.period || 0)), 0)
  const shownVp = unknown === "VP" ? targetValue : baseVp + extrasPresent; const shownVf = unknown === "VF" ? targetValue : baseVf + extrasFuture; const shownA = unknown === "A" ? annuityPaymentFromPresent(targetValue, i, n, due) : a
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-accent" aria-hidden="true" /><div><h2 className="font-display text-lg font-bold">Simulador de anualidades</h2><p className="text-sm text-muted-foreground">Siempre usa interés compuesto y cuotas periódicas.</p></div></div><div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Tipo de anualidad"><div className="flex rounded-lg border border-border p-1"><button type="button" className={`flex-1 rounded-md px-3 py-2 text-sm ${!due ? "bg-accent text-accent-foreground" : ""}`} onClick={() => setDue(false)}>Vencida</button><button type="button" className={`flex-1 rounded-md px-3 py-2 text-sm ${due ? "bg-accent text-accent-foreground" : ""}`} onClick={() => setDue(true)}>Anticipada</button></div></Field><Field label="¿Qué quieres calcular?"><SelectInput value={unknown} onChange={(e) => setUnknown(e.target.value as Unknown)}><option value="VP">Valor presente (VP)</option><option value="VF">Valor futuro (VF)</option><option value="A">Valor de la cuota (A)</option></SelectInput></Field>{unknown !== "A" && <Field label="Cuota A"><input className={inputClass} type="number" min="0" value={payment} onChange={(e) => setPayment(e.target.value)} /></Field>}{unknown === "A" && <Field label="Valor presente objetivo"><input className={inputClass} type="number" min="0" value={target} onChange={(e) => setTarget(e.target.value)} /></Field>}<Field label="Tasa efectiva por periodo (%)"><input className={inputClass} type="number" min="0" value={rate} onChange={(e) => setRate(e.target.value)} /></Field><Field label="Número de pagos"><input className={inputClass} type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} /></Field></div>{invalid && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{invalid}</p>}<div className="mt-5 grid gap-3 sm:grid-cols-3"><Result label="Valor presente" value={formatMoney(shownVp, currency)} /><Result label="Valor futuro" value={formatMoney(shownVf, currency)} /><Result label="Cuota calculada" value={formatMoney(shownA, currency)} /></div><div className="mt-5 rounded-xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">Pagos extraordinarios</p><p className="text-xs text-muted-foreground">Se llevan al VP y VF con interés compuesto.</p></div><button type="button" className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-sm" onClick={() => setExtra([...extra, { id: Date.now(), amount: "", period: "1" }])}><Plus className="h-4 w-4" aria-hidden="true" />Agregar</button></div><div className="mt-3 grid gap-2">{extra.map((item) => <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={item.id}><input className={inputClass} aria-label="Monto del pago extra" type="number" min="0" placeholder="Monto" value={item.amount} onChange={(e) => setExtra(extra.map((x) => x.id === item.id ? { ...x, amount: e.target.value } : x))} /><input className={inputClass} aria-label="Periodo del pago extra" type="number" min="1" max={n || 1} placeholder="Periodo" value={item.period} onChange={(e) => setExtra(extra.map((x) => x.id === item.id ? { ...x, period: e.target.value } : x))} /><button type="button" aria-label="Eliminar pago extra" className="rounded-lg border border-border px-3" onClick={() => setExtra(extra.filter((x) => x.id !== item.id))}><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div>)}</div></div></section>
}

function Result({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-secondary p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-serif text-xl">{value}</p></div> }
