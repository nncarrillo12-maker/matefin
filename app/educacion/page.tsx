import type { Metadata } from "next"
import { EducationView } from "@/components/education/education-view"

export const metadata: Metadata = {
  title: "Educación financiera · Finanzas Claras",
  description:
    "Aprende qué son el interés simple, el interés compuesto y el interés continuo con explicaciones claras, fórmulas y ejemplos resueltos.",
}

export default function EducacionPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <header className="mb-8">
        <p className="text-sm font-semibold text-primary">Sección 1</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Educación financiera</h1>
        <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          Aquí entiendes, sin necesidad de saber matemáticas, cómo funcionan los tres tipos de interés. Cada concepto
          incluye qué es, cómo funciona, cuándo se usa, su fórmula, una explicación sencilla y un ejemplo resuelto paso
          a paso.
        </p>
      </header>
      <EducationView />
    </div>
  )
}
