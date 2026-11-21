import type { Metadata } from "next"
import { InteractionsView } from "@/components/interactions/interactions-view"

export const metadata: Metadata = {
  title: "Interacciones con IA",
  description:
    "Documentación del trabajo con inteligencia artificial durante la construcción de la herramienta financiera.",
}

export default function InteraccionesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <InteractionsView />
    </main>
  )
}
