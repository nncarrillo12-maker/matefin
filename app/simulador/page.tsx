import type { Metadata } from "next"
import { SimulatorView } from "@/components/simulator/simulator-view"

export const metadata: Metadata = {
  title: "Simulador financiero",
  description:
    "Calculadora del valor del dinero en el tiempo: interés simple, compuesto y continuo, con flujo único y ecuaciones de valor.",
}

export default function SimuladorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <SimulatorView />
    </main>
  )
}
