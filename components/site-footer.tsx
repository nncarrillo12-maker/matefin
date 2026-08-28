import Link from "next/link"
import { Sparkles } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="max-w-md">
            <p className="font-display text-sm font-bold">Finanzas Claras</p>
            <p className="mt-1 text-sm text-muted-foreground text-pretty">
              Herramienta digital de educación financiera. Matemáticas Financieras · Primer Corte · 2026-2.
            </p>
          </div>

          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-2">
              <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
              <span className="text-muted-foreground">
                Construida con la herramienta de IA <span className="font-semibold text-foreground">v0 de Vercel</span>
              </span>
            </div>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground" aria-label="Enlaces del pie de página">
              <Link href="/educacion" className="hover:text-foreground">
                Educación
              </Link>
              <Link href="/simulador" className="hover:text-foreground">
                Simulador
              </Link>
              <Link href="/interacciones" className="hover:text-foreground">
                Interacciones
              </Link>
            </nav>
          </div>
        </div>
        <p className="mt-6 border-t border-border pt-4 text-xs text-muted-foreground">
          Formato numérico colombiano: punto para miles y coma para decimales. Los cálculos son referenciales para fines
          educativos.
        </p>
      </div>
    </footer>
  )
}
