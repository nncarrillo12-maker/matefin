import { AlertTriangle, ExternalLink, MessageSquare, Bot, Wrench, CheckCircle2, Eye } from "lucide-react"
import { INTERACTIONS, type Interaction } from "./data"

export function InteractionsView() {
  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Interacciones</p>
        <h1 className="text-balance font-serif text-3xl md:text-4xl">Nuestro trabajo con inteligencia artificial</h1>
        <p className="max-w-3xl text-pretty leading-relaxed text-muted-foreground">
          Un profesional que usa IA de manera competente no acepta la primera respuesta sin evaluarla. Aquí
          documentamos las interacciones relevantes que tuvimos al construir esta herramienta: qué le pedimos a la IA,
          qué respondió, cómo lo corregimos y qué parte visible del producto salió de cada una.
        </p>
      </header>

      <div className="rounded-xl border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
        <p className="text-pretty">
          <strong className="text-foreground">Cómo leer esta sección:</strong> cada tarjeta corresponde a una
          conversación real. Al menos una documenta un error de la IA que detectamos, con el valor equivocado, el valor
          correcto y la razón. Los enlaces abren la conversación original.
        </p>
      </div>

      <ol className="space-y-6">
        {INTERACTIONS.map((it) => (
          <InteractionCard key={it.id} interaction={it} />
        ))}
      </ol>
    </div>
  )
}

function InteractionCard({ interaction }: { interaction: Interaction }) {
  const hasError = !!interaction.error
  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
            {interaction.id}
          </span>
          <h2 className="font-display text-base font-bold text-pretty">{interaction.titulo}</h2>
        </div>
        {hasError && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive ring-1 ring-destructive/25">
            <AlertTriangle className="h-3.5 w-3.5" /> Error de la IA detectado
          </span>
        )}
      </div>

      <div className="grid gap-5 p-5 sm:p-6">
        <Row icon={MessageSquare} label="Prompt / instrucción" tone="primary">
          {interaction.prompt}
        </Row>
        <Row icon={Bot} label="Qué respondió la IA" tone="muted">
          {interaction.respuestaIA}
        </Row>

        {interaction.error && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 text-sm font-bold text-destructive">
              <AlertTriangle className="h-4 w-4" /> Error numérico / conceptual
            </p>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-card p-3">
                <dt className="text-xs text-muted-foreground">Valor equivocado (IA)</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-destructive line-through">
                  {interaction.error.valorIA}
                </dd>
              </div>
              <div className="rounded-lg bg-card p-3">
                <dt className="text-xs text-muted-foreground">Valor correcto</dt>
                <dd className="mt-0.5 font-mono text-sm font-semibold text-inversion">
                  {interaction.error.valorCorrecto}
                </dd>
              </div>
            </dl>
            <p className="mt-3 text-sm leading-relaxed text-foreground text-pretty">
              <strong>Por qué estaba mal:</strong> {interaction.error.razon}
            </p>
          </div>
        )}

        <Row icon={Wrench} label="Cómo lo corregimos o mejoramos" tone="muted">
          {interaction.correccion}
        </Row>
        <Row icon={CheckCircle2} label="Resultado final" tone="inversion">
          {interaction.resultadoFinal}
        </Row>
        <Row icon={Eye} label="Parte visible de la herramienta" tone="accent">
          {interaction.parteVisible}
        </Row>

        <a
          href={interaction.enlace}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary/60"
        >
          <ExternalLink className="h-4 w-4" /> Ver conversación original
        </a>
      </div>
    </li>
  )
}

function Row({
  icon: Icon,
  label,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  tone: "primary" | "muted" | "inversion" | "accent"
  children: React.ReactNode
}) {
  const toneClass =
    tone === "primary"
      ? "text-primary"
      : tone === "inversion"
        ? "text-inversion"
        : tone === "accent"
          ? "text-accent"
          : "text-muted-foreground"
  return (
    <div className="grid gap-1.5">
      <p className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${toneClass}`}>
        <Icon className="h-4 w-4" /> {label}
      </p>
      <p className="text-sm leading-relaxed text-foreground text-pretty">{children}</p>
    </div>
  )
}
