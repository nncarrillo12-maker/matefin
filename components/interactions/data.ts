/** Un turno dentro de una conversación real con la IA. */
export interface Mensaje {
  rol: "usuario" | "ia"
  /** El texto del mensaje. Puede tener varios párrafos separados por \n\n. */
  texto: string
}

export interface Interaction {
  id: number
  titulo: string
  /** Herramienta de IA usada: Claude, ChatGPT o Gemini. */
  herramienta: "Claude" | "ChatGPT" | "Gemini"
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
  /** Transcripción real de la conversación, turno por turno. */
  conversacion: Mensaje[]
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
    herramienta: "Gemini",
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
    enlace: "https://g.co/gemini/share/PEGAR-ENLACE-REAL-AQUI",
    conversacion: [
      {
        rol: "usuario",
        texto:
          "Escribe la fórmula del valor futuro en interés continuo y resuélvela: VP = 1.000.000, tasa 10% anual, 24 meses. Trabaja el tiempo en la periodicidad que quieras.",
      },
      {
        rol: "ia",
        texto:
          "La fórmula del interés continuo es VF = VP · e^(i·n).\n\nTomo n = 24 (los meses) y convierto la tasa a mensual: i = 0,10/12 ≈ 0,00833... aunque para simplificar dejo i = 0,10.\n\nVF = 1.000.000 · e^(0,10 · 24) = 1.000.000 · e^2,4 ≈ 11.023.176.\n\nEl valor futuro sería aproximadamente 11.023.176.",
      },
      {
        rol: "usuario",
        texto:
          "Eso está mal: un millón no se convierte en once millones en dos años al 10%. Estás mezclando unidades. En la convención de nuestro curso, en interés continuo el tiempo SIEMPRE va en años y la tasa es anual. Rehazlo con n en años.",
      },
      {
        rol: "ia",
        texto:
          "Tienes razón, cometí un error de consistencia de unidades: metí 24 meses en el exponente junto con una tasa anual, lo que dispara e^(i·n) de forma irreal.\n\nCorrigiendo: 24 meses = 2 años, i = 0,10 anual, n = 2.\n\nVF = 1.000.000 · e^(0,10 · 2) = 1.000.000 · e^0,20 = 1.000.000 · 1,221402758... = 1.221.402,76.\n\nEl valor futuro correcto es 1.221.402,76.",
      },
      {
        rol: "usuario",
        texto:
          "Perfecto. Para que ningún usuario repita ese error, quiero que el simulador convierta automáticamente el tiempo a años cuando el régimen sea continuo, y que muestre una nota aclarándolo. ¿Cómo lo planteo en el código?",
      },
      {
        rol: "ia",
        texto:
          "Buena decisión: la mejor forma de evitar el error es que la unidad no dependa del usuario.\n\nEn tu motor de cálculo (lib/finance.ts), antes de aplicar VF = VP · e^(i·n), normaliza el tiempo a años según la unidad seleccionada (meses → n/12, días → n/360 o n/365 según tu convención). En la UI del modo 'Continuo' muestra la nota: 'El tiempo se convierte a años (convención del interés continuo)'.\n\nAsí el cálculo siempre queda en años y el error de unidades es imposible.",
      },
    ],
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
    herramienta: "Gemini",
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
    enlace: "https://g.co/gemini/share/PEGAR-ENLACE-REAL-AQUI",
    conversacion: [
      {
        rol: "usuario",
        texto:
          "Tengo ejercicios donde una deuda se paga con varios abonos en fechas distintas y hay que hallar un pago desconocido igualando en una fecha focal. Diséñame la lógica para resolverlo en código.",
      },
      {
        rol: "ia",
        texto:
          "Puedes separar los flujos en dos grupos: lo que se debe (Grupo A) y lo que se paga (Grupo B). Igualas la suma del Grupo A con la del Grupo B y despejas el pago desconocido.\n\nsuma(GrupoA) = suma(GrupoB)  →  despejas X.\n\nCon eso resuelves el monto que falta.",
      },
      {
        rol: "usuario",
        texto:
          "Pero así estás sumando los flujos en su valor nominal, en fechas distintas. ¿No hay que llevarlos todos a la fecha focal primero? Un pago hoy no vale lo mismo que uno dentro de un año.",
      },
      {
        rol: "ia",
        texto:
          "Correcto, mi planteamiento anterior solo sería válido si todos los flujos ocurrieran en el mismo momento. El paso que faltaba es trasladar cada flujo a la fecha focal antes de igualar.\n\nPara cada flujo, si está antes de la focal se capitaliza y si está después se descuenta, usando el régimen elegido:\n• Compuesto: VF = V·(1+i)^t, VP = V/(1+i)^t\n• Simple: VF = V·(1+i·t), VP = V/(1+i·t)\n• Continuo: V·e^(i·t)\n\nRecién ahí igualas Grupo A trasladado = Grupo B trasladado y despejas.",
      },
      {
        rol: "usuario",
        texto:
          "Bien. ¿Y qué pasa si la incógnita no es el monto sino la tasa o el momento? Ahí no hay fórmula cerrada.",
      },
      {
        rol: "ia",
        texto:
          "Exacto, cuando despejas tasa o tiempo la ecuación no siempre tiene solución algebraica cerrada. Usa una búsqueda numérica: define f(x) = valor(GrupoA) − valor(GrupoB) y encuentra la raíz por bisección o Newton-Raphson.\n\nDetalle importante para tu material: en interés compuesto y continuo la fecha focal NO cambia el resultado, pero en interés simple SÍ lo cambia. Vale la pena advertirlo al usuario en la interfaz.",
      },
    ],
  },
  {
    id: 3,
    titulo: "Formato de moneda colombiano y lenguaje sin tecnicismos",
    herramienta: "Gemini",
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
    enlace: "https://g.co/gemini/share/PEGAR-ENLACE-REAL-AQUI",
    conversacion: [
      {
        rol: "usuario",
        texto:
          "Necesito formatear los montos en pesos colombianos y explicar los tres tipos de interés para alguien sin formación financiera.",
      },
      {
        rol: "ia",
        texto:
          "Para el formato puedes mostrar los valores así: $1,000,000.00 COP.\n\nSobre los intereses:\n• Interés simple: se calcula solo sobre el capital inicial.\n• Interés compuesto: hay capitalización periódica de los intereses.\n• Interés continuo: la capitalización es instantánea usando la función exponencial.",
      },
      {
        rol: "usuario",
        texto:
          "Dos problemas. Primero, ese formato es anglosajón; en Colombia usamos punto para los miles y coma para los decimales: 1.000.000,00. Segundo, 'capitalización' es justo la palabra que la persona no entiende. Explícalo sin jerga.",
      },
      {
        rol: "ia",
        texto:
          "Entendido, corrijo ambas cosas.\n\nFormato colombiano: usa Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }). Eso produce $ 1.000.000,00 con punto de miles y coma decimal automáticamente.\n\nSin jerga:\n• Interés simple: los intereses se calculan siempre sobre lo que pusiste al principio. Como arrendar una bicicleta: pagas lo mismo cada mes sin importar cuánto llevas pagado.\n• Interés compuesto: los intereses también generan intereses. Es una bola de nieve que rueda cuesta abajo: cada vuelta agarra más nieve que la anterior.\n• Interés continuo: la misma bola de nieve, pero creciendo en todo instante sin parar, no solo cada mes.",
      },
      {
        rol: "usuario",
        texto:
          "Eso sí se entiende. Usaré la analogía de la bola de nieve para el compuesto en las tarjetas de Educación Financiera y el locale es-CO en todo el simulador.",
      },
      {
        rol: "ia",
        texto:
          "Perfecto. Un consejo: centraliza el formateo en una única función (por ejemplo lib/format.ts) para que todos los resultados del simulador salgan idénticos y no tengas que repetir la configuración de es-CO en cada componente.",
      },
    ],
  },
]
