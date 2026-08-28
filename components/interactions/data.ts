export interface Interaction {
  id: number
  titulo: string
  /** El prompt o instrucción que se le dio a la IA. */
  prompt: string
  /** Lo que la IA respondió / produjo. */
  respuestaIA: string
  /** Cómo se corrigió o mejoró: nuevo prompt, edición manual, cambio de enfoque. */
  correccion: string
  /** El resultado final que quedó en la herramienta. */
  resultadoFinal: string
  /** Qué parte concreta y VISIBLE de la herramienta salió de esta interacción. */
  parteVisible: string
  /** Enlace compartible de la conversación original (Claude / ChatGPT / Gemini). */
  enlace: string
  /** Datos del error detectado (obligatorio en al menos una interacción). */
  error?: {
    valorIA: string
    valorCorrecto: string
    razon: string
  }
}

// NOTA PARA EL EQUIPO:
// Reemplacen estos textos por sus interacciones reales y peguen los enlaces
// compartibles de sus conversaciones. Al menos una interacción DEBE documentar
// un error numérico o conceptual de la IA (campo "error").
export const INTERACTIONS: Interaction[] = [
  {
    id: 1,
    titulo: "Convención del interés continuo (error numérico detectado)",
    prompt:
      "Escribe la fórmula para calcular el valor futuro en interés continuo y resuelve: VP = 1.000.000, tasa 10% anual, 24 meses. Trabaja el tiempo en la periodicidad que quieras.",
    respuestaIA:
      "La IA usó la fórmula VF = VP · e^(i·n) pero tomó n = 24 (interpretando el tiempo en meses) y una tasa mensual mal derivada, entregando VF ≈ 11.023.176.",
    correccion:
      "Le indicamos que, por convención del curso, en interés continuo el tiempo SIEMPRE se expresa en años. Reformulamos el prompt exigiendo n en años (24 meses = 2 años) y tasa anual. Además fijamos esta regla directamente en el motor de cálculo (lib/finance.ts) para que el usuario no pueda equivocarse.",
    resultadoFinal:
      "VF = VP · e^(0,10 · 2) = 1.000.000 · e^0,20 = 1.221.402,76. La herramienta ahora convierte automáticamente años y meses a años en el régimen continuo.",
    parteVisible:
      "El selector de tiempo del Simulador en modo 'Continuo' y la nota que aclara: 'El tiempo se convierte a años (convención del interés continuo)'.",
    enlace: "https://claude.ai/share/PEGAR-ENLACE-REAL-AQUI",
    error: {
      valorIA: "VF ≈ 11.023.176",
      valorCorrecto: "VF = 1.221.402,76",
      razon:
        "La IA no respetó la convención de que el tiempo en interés continuo va en años: metió 24 (meses) en el exponente en lugar de 2 (años), inflando e^(i·n) de forma absurda.",
    },
  },
  {
    id: 2,
    titulo: "Ecuación de valor con múltiples flujos y fecha focal",
    prompt:
      "Necesito resolver ejercicios donde una deuda se paga con varios abonos en fechas distintas y hay que hallar el valor de un pago desconocido igualando en una fecha focal. Diséñame la lógica.",
    respuestaIA:
      "La primera versión sumaba los flujos sin trasladarlos a la fecha focal (los comparaba en su valor nominal), lo que solo es correcto si todos ocurren en el mismo momento.",
    correccion:
      "Cambiamos el enfoque: cada flujo se lleva a la fecha focal con el régimen elegido (simple, compuesto o continuo) antes de igualar el Grupo A con el Grupo B, y se despeja la incógnita con búsqueda numérica cuando no hay fórmula cerrada.",
    resultadoFinal:
      "El modo 'Ecuación de valor' traslada correctamente todos los flujos a la focal y despeja monto, tasa o momento. Se aclara que en interés compuesto y continuo la focal no cambia el resultado, pero en simple sí.",
    parteVisible:
      "Todo el modo 'Ecuación de valor' del Simulador: la lista de flujos, el campo de fecha focal y los totales por grupo.",
    enlace: "https://chatgpt.com/share/PEGAR-ENLACE-REAL-AQUI",
  },
  {
    id: 3,
    titulo: "Formato de moneda colombiano y lenguaje sin tecnicismos",
    prompt:
      "Formatea los montos en pesos colombianos y explica los tres tipos de interés para una persona sin formación financiera.",
    respuestaIA:
      "La IA usó formato anglosajón (1,000,000.00) y explicaciones con jerga como 'capitalización' sin definirla.",
    correccion:
      "Ajustamos el formateo a la convención colombiana (punto de miles y coma decimal: 1.000.000,00) usando Intl.NumberFormat con locale es-CO, y reescribimos la sección educativa con analogías cotidianas (una bola de nieve para el interés compuesto).",
    resultadoFinal:
      "Todos los montos se muestran como $ 1.000.000,00 COP y la sección de Educación Financiera explica cada régimen con ejemplos de la vida diaria.",
    parteVisible:
      "El formato de todos los resultados del Simulador y las tarjetas explicativas de la sección Educación Financiera.",
    enlace: "https://gemini.google.com/share/PEGAR-ENLACE-REAL-AQUI",
  },
]
