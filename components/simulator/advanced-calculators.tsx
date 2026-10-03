"use client"

import { useMemo, useState } from "react"
import { ArrowRightLeft, Calculator, Plus, Trash2 } from "lucide-react"
import { annuityFuture, annuityPaymentFromFuture, annuityPaymentFromPresent, annuityPresent, convertRate, RATE_PERIODS, type RateKind, type RateMode, type RatePeriod } from "@/lib/rates"
import { formatMoney } from "@/lib/format"
import { Field, SelectInput, Segmented, TextInput } from "./ui"

const inputClass = "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
type RateConfig = { kind: RateKind; mode: RateMode; period: RatePeriod; customMonths: number }

function RateFields({ prefix, value, setValue }: { prefix: string; value: RateConfig; setValue: (value: RateConfig) => void }) {
  return <div className="grid gap-3 sm:grid-cols-2">
    <Field label={`${prefix}: tipo`}><SelectInput value={value.kind} onChange={(e) => setValue({ ...value, kind: e.target.value as RateKind })}><option value="efectiva">Efectiva / periódica</option><option value="nominal">Nominal</option></SelectInput></Field>
    <Field label={`${prefix}: modalidad`}><SelectInput value={value.mode} onChange={(e) => setValue({ ...value, mode: e.target.value as RateMode })}><option value="vencida">Vencida</option><option value="anticipada">Anticipada</option></SelectInput></Field>
    <Field label={`${prefix}: periodo`}><SelectInput value={value.period} onChange={(e) => setValue({ ...value, period: e.target.value as RatePeriod })}>{RATE_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</SelectInput></Field>
    {value.period === "custom" && <Field label="Cada cuántos meses"><TextInput type="number" min="0.01" step="0.01" value={value.customMonths || ""} onChange={(e) => setValue({ ...value, customMonths: Number(e.target.value) })} /></Field>}
  </div>
}

export function RateConverter() {
  const [rate, setRate] = useState("24")
  const [from, setFrom] = useState<RateConfig>({ kind: "nominal", mode: "vencida", period: "mensual", customMonths: 1 })
  const [to, setTo] = useState<RateConfig>({ kind: "efectiva", mode: "vencida", period: "anual", customMonths: 1 })
  const numericRate = Number(rate)
  const invalidCustomPeriod = [from, to].find((config) => config.period === "custom" && (!Number.isFinite(config.customMonths) || config.customMonths <= 0))
  const error = rate === "" ? "Ingresa una tasa." : !Number.isFinite(numericRate) || numericRate < 0 ? "La tasa no puede ser negativa." : invalidCustomPeriod ? "Los meses de capitalización deben ser mayores que cero." : null
  const result = useMemo(() => { if (error) return null; try { return convertRate({ ...from, rate: numericRate / 100 }, to) * 100 } catch { return null } }, [error, from, numericRate, to])
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-2"><ArrowRightLeft className="h-5 w-5 text-accent" aria-hidden="true" /><div><h2 className="font-display text-lg font-bold">Conversión de tasas</h2><p className="text-sm text-muted-foreground">Convierte cualquier tasa equivalente con interés compuesto.</p></div></div><div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto_1fr]"><div className="space-y-3"><Field label="Tasa de entrada (%)"><TextInput type="number" min="0" step="0.01" value={rate} aria-invalid={Boolean(error)} onChange={(e) => setRate(e.target.value)} />{error && <p className="text-sm text-destructive">{error}</p>}</Field><RateFields prefix="Entrada" value={from} setValue={setFrom} /></div><div className="hidden items-center justify-center lg:flex"><ArrowRightLeft className="h-5 w-5 text-muted-foreground" aria-hidden="true" /></div><div><RateFields prefix="Salida" value={to} setValue={setTo} /><div className="mt-5 rounded-xl bg-accent/10 p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">Resultado equivalente</p><p className="mt-1 font-serif text-3xl text-accent">{result == null ? "—" : `${result.toLocaleString("es-CO", { maximumFractionDigits: 6 })}%`}</p></div></div></div></section>
}

type Extra = { id: number; amount: string; period: string }
type Unknown = "VP" | "VF" | "A" | "X"
const money = (value: number, currency: "COP" | "USD" | "EUR") => formatMoney(Number.isFinite(value) ? value : 0, currency)

export function AnnuityCalculator({ currency }: { currency: "COP" | "USD" | "EUR" }) {
  const [due, setDue] = useState(false)
  const [operation, setOperation] = useState<"credito" | "inversion">("credito")
  const [unknown, setUnknown] = useState<Unknown>("VP")
  const [payment, setPayment] = useState("100000")
  const [target, setTarget] = useState("1000000")
  const [rate, setRate] = useState("24")
  const [count, setCount] = useState("12")
  const [rateConfig, setRateConfig] = useState<RateConfig>({ kind: "efectiva", mode: "vencida", period: "anual", customMonths: 1 })
  const [paymentPeriod, setPaymentPeriod] = useState<RatePeriod>("mensual")
  const [extra, setExtra] = useState<Extra[]>([])
  const i = useMemo(() => { try { return convertRate({ rate: Number(rate) / 100, ...rateConfig }, { kind: "efectiva", mode: "vencida", period: paymentPeriod, customMonths: rateConfig.customMonths }) } catch { return Number.NaN } }, [rate, rateConfig, paymentPeriod])
  const n = Number(count), a = Number(payment), targetValue = Number(target)
  const invalid = rate === "" || !Number.isFinite(Number(rate)) || Number(rate) < 0 ? "La tasa no puede ser negativa." : !Number.isFinite(i) ? "Revisa la configuración de la tasa." : count === "" || !Number.isFinite(n) || n <= 0 ? "El número de periodos debe ser mayor que cero." : null
  const extrasPresent = extra.reduce((sum, item) => sum + Number(item.amount || 0) / Math.pow(1 + i, Number(item.period || 0)), 0)
  const extrasFuture = extra.reduce((sum, item) => sum + Number(item.amount || 0) * Math.pow(1 + i, n - Number(item.period || 0)), 0)
  const baseVp = annuityPresent(a, i, n, due), baseVf = annuityFuture(a, i, n, due)
  const result = invalid ? null : unknown === "VP" ? baseVp + extrasPresent : unknown === "VF" ? baseVf + extrasFuture : unknown === "A" ? annuityPaymentFromPresent(targetValue - extrasPresent, i, n, due) : (targetValue - baseVf) / Math.pow(1 + i, n - Number(extra[0]?.period || n))
  const addExtra = () => setExtra([...extra, { id: Date.now(), amount: "0", period: "1" }])
  return <section className="rounded-2xl border border-border bg-card p-5 sm:p-6"><div className="flex items-center gap-2"><Calculator className="h-5 w-5 text-accent" aria-hidden="true" /><div><h2 className="font-display text-lg font-bold">Simulador de anualidades</h2><p className="text-sm text-muted-foreground">Anualidades vencidas y anticipadas con tasa efectiva vencida por periodo.</p></div></div>
    <div className="mt-5 grid gap-4 md:grid-cols-2"><Field label="Tipo de operación"><Segmented ariaLabel="Tipo de operación" value={operation} onChange={setOperation} options={[{ value: "credito", label: "Crédito", accent: "credito" }, { value: "inversion", label: "Inversión", accent: "inversion" }]} /></Field><Field label="Tipo de anualidad"><Segmented ariaLabel="Tipo de anualidad" value={due ? "anticipada" : "vencida"} onChange={(v) => setDue(v === "anticipada")} options={[{ value: "vencida", label: "Vencida" }, { value: "anticipada", label: "Anticipada" }]} /></Field><Field label="Incógnita"><SelectInput value={unknown} onChange={(e) => setUnknown(e.target.value as Unknown)}><option value="VP">Valor presente (VP)</option><option value="VF">Valor futuro (VF)</option><option value="A">Cuota (A)</option><option value="X">Pago adicional desconocido (X)</option></SelectInput></Field><Field label={unknown === "A" ? "VP objetivo" : "Cuota A"}><TextInput type="number" min="0" value={unknown === "A" ? target : payment} onChange={(e) => (unknown === "A" ? setTarget(e.target.value) : setPayment(e.target.value))} /></Field><Field label="Tasa ingresada (%)"><TextInput type="number" min="0" step="0.01" value={rate} aria-invalid={Boolean(invalid)} onChange={(e) => setRate(e.target.value)} /></Field><Field label="Número de cuotas"><TextInput type="number" min="1" value={count} aria-invalid={Boolean(invalid)} onChange={(e) => setCount(e.target.value)} /></Field><Field label="Periodo de cuotas"><SelectInput value={paymentPeriod} onChange={(e) => setPaymentPeriod(e.target.value as RatePeriod)}>{RATE_PERIODS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}</SelectInput></Field></div>
    <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-4"><p className="mb-3 text-sm font-semibold">Conversión automática de tasa a la periodicidad de las cuotas</p><RateFields prefix="Tasa" value={rateConfig} setValue={setRateConfig} /><p className="mt-3 text-xs text-muted-foreground">La fórmula usa siempre una tasa efectiva vencida equivalente al periodo de pago: {Number.isFinite(i) ? `${(i * 100).toLocaleString("es-CO", { maximumFractionDigits: 6 })}%` : "—"}.</p></div>
    <div className="mt-5 rounded-xl border border-border p-4"><div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold">Pagos adicionales extraordinarios</h3><p className="text-xs text-muted-foreground">Indica el monto y el periodo exacto. Se llevan al VP o VF automáticamente.</p></div><button type="button" onClick={addExtra} className="inline-flex items-center gap-1 rounded-lg bg-secondary px-3 py-2 text-sm font-medium"><Plus className="h-4 w-4" aria-hidden="true" />Agregar</button></div>{extra.length > 0 && <div className="mt-3 flex flex-col gap-2">{extra.map((item, index) => <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]" key={item.id}><TextInput aria-label={`Monto adicional ${index + 1}`} type="number" min="0" value={item.amount} onChange={(e) => setExtra(extra.map((x) => x.id === item.id ? { ...x, amount: e.target.value } : x))} placeholder="Monto" /><TextInput aria-label={`Periodo adicional ${index + 1}`} type="number" min="0" step="0.01" value={item.period} onChange={(e) => setExtra(extra.map((x) => x.id === item.id ? { ...x, period: e.target.value } : x))} placeholder="Periodo" /><button type="button" aria-label={`Eliminar pago adicional ${index + 1}`} onClick={() => setExtra(extra.filter((x) => x.id !== item.id))} className="rounded-lg px-3 text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" aria-hidden="true" /></button></div>)}</div>}</div>
    {invalid && <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{invalid}</p>}
    <div className="mt-5 grid gap-3 sm:grid-cols-3"><Result label="Valor presente" value={money(unknown === "VP" ? result ?? 0 : baseVp + extrasPresent, currency)} /><Result label="Valor futuro" value={money(unknown === "VF" ? result ?? 0 : baseVf + extrasFuture, currency)} /><Result label={unknown === "A" ? "Cuota calculada" : unknown === "X" ? "Pago adicional X" : "Cuota ingresada"} value={money(unknown === "A" || unknown === "X" ? result ?? 0 : a, currency)} /></div><p className="mt-5 text-xs text-muted-foreground">Módulo generado con asistencia de IA Gemini. Los valores se muestran en formato colombiano.</p>
  </section>
}

function Result({ label, value }: { label: string; value: string }) { return <div className="rounded-xl bg-secondary p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-serif text-xl">{value}</p></div> }

export { RateFields }

// End of module
//
// All formulas intentionally keep the number of periods and the rate as known inputs.
// The annuity engine converts nominal or anticipated rates to effective due rates before use.
// No authentication or external persistence is required by this educational calculator.
// Gemini attribution is shown in the module footer.
