"use client"

import { useState, type KeyboardEvent } from "react"
import Link from "next/link"
import { Baby, HelpCircle, Cog, Target, Sigma, Lightbulb, ClipboardCheck } from "lucide-react"
import { CONCEPTS, type InterestConcept } from "./content"
import { THIRD_CUT_CONCEPTS } from "./tercer-corte"
import { cn } from "@/lib/utils"

const TOPICS = [...CONCEPTS, ...THIRD_CUT_CONCEPTS]
type TopicId = (typeof TOPICS)[number]["id"]

export function EducationView() {
  const [active, setActive] = useState<TopicId>("simple")
  const concept = CONCEPTS.find((c) => c.id === active)
  const thirdCut = THIRD_CUT_CONCEPTS.find((c) => c.id === active)

  function navigateTopics(event: KeyboardEvent<HTMLDivElement>) {
    const index = TOPICS.findIndex((topic) => topic.id === active)
    const last = TOPICS.length - 1
    let next: number
    switch (event.key) {
      case "ArrowLeft":
        next = index === 0 ? last : index - 1
        break
      case "ArrowRight":
        next = index === last ? 0 : index + 1
        break
      case "Home":
        next = 0
        break
      case "End":
        next = last
        break
      default:
        return
    }
    event.preventDefault()
    setActive(TOPICS[next].id)
    event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus()
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Lightbulb className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <p className="font-display text-sm font-bold">Cómo se conecta con el Primer Corte</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Las anualidades se calculan utilizando las fórmulas y fundamentos del Interés Compuesto. Cada pago gana o
            pierde valor con el paso del tiempo, igual que una bola de nieve que crece periodo a periodo.
          </p>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Conceptos de educación financiera"
        onKeyDown={navigateTopics}
        className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-card p-1.5 sm:grid-cols-3 lg:grid-cols-5"
      >
        {TOPICS.map((c) => (
          <button
            key={c.id}
            id={`concepto-${c.id}`}
            type="button"
            role="tab"
            aria-selected={active === c.id}
            aria-controls="concepto-contenido"
            tabIndex={active === c.id ? 0 : -1}
            onClick={() => setActive(c.id)}
            className={cn(
              "rounded-lg px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-ring",
              active === c.id ? "bg-primary text-primary-foreground" : "hover:bg-secondary/60",
            )}
          >
            <span className="block font-display text-sm font-bold">{c.nombre}</span>
            <span
              className={cn(
                "mt-0.5 block text-xs",
                active === c.id ? "text-primary-foreground/80" : "text-muted-foreground",
              )}
            >
              {c.tagline}
            </span>
          </button>
        ))}
      </div>

      <div id="concepto-contenido" role="tabpanel" aria-labelledby={`concepto-${active}`} tabIndex={0}>
        {concept && <InterestConceptPanel concept={concept} />}
        {thirdCut && (
          <section className="mt-6 space-y-4 rounded-xl border border-border bg-card p-5 leading-relaxed sm:p-6">
            <h2 className="font-display text-2xl font-bold">{thirdCut.nombre}</h2>
            <p className="rounded-lg bg-primary/5 p-3 text-sm text-muted-foreground">
              Para calcular usamos la <strong>tasa efectiva vencida del periodo de la cuota</strong>.
              Si los pagos son mensuales, el conversor del segundo corte lleva la tasa a efectiva mensual vencida.
            </p>
            {thirdCut.contenido}
            <Link href="/tercer-corte" className="inline-block font-semibold text-primary underline">
              Practicar en el simulador
            </Link>
          </section>
        )}
      </div>
    </div>
  )
}

function InterestConceptPanel({ concept }: { concept: InterestConcept }) {
  const active = concept.id

  return (
    <div className="mt-6 grid gap-4">
      <Block icon={HelpCircle} titulo="¿Qué es?">
        {concept.queEs}
      </Block>

      <Block icon={Cog} titulo="¿Cómo funciona?">
        {concept.comoFunciona}
      </Block>

      <Block icon={Target} titulo={concept.terceraPregunta}>
        {concept.terceraRespuesta}
      </Block>

      {/* Fórmula */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <Sigma className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="font-display text-base font-bold">Fórmula</h3>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg bg-foreground px-4 py-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-background/60">{active === "conversion" ? "Tasa efectiva anual" : "Valor futuro"}</p>
            <p className="mt-1 font-mono text-lg font-semibold text-background">{concept.formula}</p>
          </div>
          <div className="rounded-lg bg-secondary px-4 py-5 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {active === "conversion" ? "Tasa periódica vencida" : active.startsWith("anualidad") ? "Valor presente" : "Ganancia neta (intereses)"}
            </p>
            <p className="mt-1 font-mono text-lg font-semibold text-foreground">{concept.formulaInteres}</p>
          </div>
        </div>
        <dl className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {concept.variables.map((v) => (
            <div key={v.simbolo} className="flex items-baseline gap-2 text-sm">
              <dt className="font-mono font-bold text-primary">{v.simbolo}</dt>
              <dd className="text-muted-foreground">{v.nombre}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Explicación sencilla */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Baby className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="font-display text-base font-bold">Explicación para un niño de 5 años</h3>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-foreground text-pretty">{concept.explicacionSencilla}</p>
      </div>

      {/* Ejemplo resuelto */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
            <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <h3 className="font-display text-base font-bold">Un ejemplo práctico resuelto</h3>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-foreground text-pretty">{concept.ejemplo.enunciado}</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {concept.ejemplo.datos.map((d) => (
            <span
              key={d.label}
              className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs"
            >
              <span className="font-mono font-bold text-primary">{d.label}</span>
              <span className="text-muted-foreground">{d.value}</span>
            </span>
          ))}
        </div>

        <ol className="mt-4 space-y-2.5">
          {concept.ejemplo.pasos.map((p, idx) => (
            <li key={idx} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
                {idx + 1}
              </span>
              <div>
                <p className="text-sm text-foreground">{p.texto}</p>
                {p.calculo && (
                  <p className="mt-1 rounded-md bg-secondary/60 px-3 py-1.5 font-mono text-sm text-foreground">
                    {p.calculo}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-4 flex items-start gap-2.5 rounded-lg bg-primary px-4 py-3 text-primary-foreground">
          <Lightbulb className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
          <p className="text-sm font-semibold">{concept.ejemplo.resultado}</p>
        </div>
      </div>
    </div>
  )
}

function Block({
  icon: Icon,
  titulo,
  children,
}: {
  icon: typeof HelpCircle
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-primary">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <h3 className="font-display text-base font-bold">{titulo}</h3>
      </div>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground text-pretty">{children}</p>
    </div>
  )
}
