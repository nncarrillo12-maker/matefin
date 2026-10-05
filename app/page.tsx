import Link from "next/link"
import {
  BookOpen,
  Calculator,
  MessageSquareCode,
  ArrowRight,
  TrendingUp,
  Coins,
  Percent,
} from "lucide-react"

const sections = [
  {
    href: "/educacion",
    icon: BookOpen,
    title: "Educación financiera",
    desc: "Entiende el interés simple, compuesto y continuo con explicaciones tan claras que las entendería un niño de 5 años, sin perder precisión técnica.",
    cta: "Aprender los conceptos",
  },
  {
    href: "/simulador",
    icon: Calculator,
    title: "Simulador / Cotización",
    desc: "Calcula créditos e inversiones en los tres regímenes de interés. Resuelve VF, VP, tasa, tiempo, flujos desconocidos y ecuaciones de valor.",
    cta: "Abrir el simulador",
  },
  {
    href: "/interacciones",
    icon: MessageSquareCode,
    title: "Interacciones con IA",
    desc: "Documentación del trabajo con inteligencia artificial: prompts, errores detectados, correcciones y qué parte de la herramienta salió de cada interacción.",
    cta: "Ver la documentación",
  },
]

const capabilities = [
  "Periodicidad de la tasa configurable (mensual, bimestral, trimestral, cuatrimestral, semestral, anual y cada N meses)",
  "Tiempo en años y meses con conversión automática a periodos, y resultado del tiempo en años y meses",
  "Varios flujos de dinero en momentos distintos (ecuación de valor)",
  "Incógnita seleccionable: VF, VP, tasa, tiempo, valor de un flujo o momento de un flujo",
  "Ganancia neta de la operación (solo los intereses)",
  "Coeficiente configurable por flujo (\u201cel primer desembolso fue 1,4 veces el segundo\u201d)",
  "Tres monedas: COP, EUR y USD",
  "Los tres regímenes de interés (en continuo el tiempo va en años)",
]

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <h1 className="text-balance font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Toma mejores decisiones con tu dinero
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              Una herramienta del banco para entender cómo funcionan los intereses y simular créditos e inversiones
              reales. Ve el impacto del tiempo, la tasa y el capital antes de decidir.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/simulador"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
              >
                Abrir el simulador
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link
                href="/educacion"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60"
              >
                Aprender los conceptos
              </Link>
            </div>
          </div>

          {/* Panel decorativo con los tres regímenes */}
          <div className="flex items-center justify-center">
            <div className="grid w-full max-w-sm gap-4">
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Percent className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display font-bold">Interés simple</p>
                    <p className="text-sm text-muted-foreground">Crece siempre sobre el capital inicial</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <TrendingUp className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display font-bold">Interés compuesto</p>
                    <p className="text-sm text-muted-foreground">Los intereses también generan intereses</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary text-primary">
                    <Coins className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-display font-bold">Interés continuo</p>
                    <p className="text-sm text-muted-foreground">Crecimiento en cada instante</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secciones */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">La herramienta tiene tres secciones</h2>
        <p className="mt-2 max-w-2xl text-muted-foreground text-pretty">
          Aprende, simula y revisa cómo se construyó. Todo pensado para un cliente sin formación técnica.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {sections.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group flex flex-col rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                <s.icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <h3 className="mt-4 font-display text-lg font-bold">{s.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">{s.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {s.cta}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Capacidades */}
      <section className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight text-balance">
                Qué resuelve el simulador
              </h2>
              <p className="mt-3 text-muted-foreground text-pretty">
                Cumple las ocho capacidades obligatorias del primer corte. No es una calculadora de cuatro variables:
                resuelve ejercicios reales con varios flujos y distintas incógnitas.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="rounded-full bg-inversion/10 px-3 py-1 text-xs font-semibold text-inversion ring-1 ring-inversion/20">
                  Inversión
                </span>
                <span className="rounded-full bg-credito/10 px-3 py-1 text-xs font-semibold text-credito ring-1 ring-credito/20">
                  Crédito
                </span>
              </div>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {capabilities.map((c, idx) => (
                <li key={idx} className="flex gap-3 rounded-xl border border-border bg-background p-4">
                  <span className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {String.fromCharCode(97 + idx)}
                  </span>
                  <span className="text-sm leading-relaxed text-foreground text-pretty">{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
