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
  /** Qué faltaba comprobar o mejorar en la primera respuesta. */
  revision?: string
  seguimiento?: { prompt: string; respuesta: string }
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
    enlace: "https://share.gemini.google/nHWMT4ccw83p",
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

/** Interacciones del Segundo Corte: conversión de tasas y anualidades. */
export const SECOND_CUT_INTERACTIONS: Interaction[] = [
  {
    "id": 4,
    "titulo": "Tasa mensual y plazo de una inversión",
    "herramienta": "ChatGPT",
    "prompt": "Comprobar el resultado de invertir $1.000.000 durante tres años al 24 % nominal anual trimestre vencido y revisar las unidades mostradas.",
    "respuestaIA": "El 24 % nominal se divide entre cuatro. El 6 % trimestral equivale a (1,06)^(1/3) − 1, aproximadamente 1,9613 % mensual.",
    "correccion": "La versión anterior mostraba «1,9613 % por trimestre» y «36 trimestres». El cálculo usaba meses. Se corrigieron ambas etiquetas para que el lector pueda reproducirlo.",
    "resultadoFinal": "$1.000.000 × 1,06¹² = $2.012.196,47. El mismo monto se obtiene con 36 meses usando la tasa mensual sin redondear.",
    "parteVisible": "Simulador → Flujo único → Compuesto. El resumen presenta la tasa por mes y el tiempo en meses.",
    "enlace": "https://chatgpt.com/share/6b021b2a-e2cc-83ea-b201-5ad334884964",
    "conversacion": []
  },
  {
    "id": 5,
    "titulo": "El mismo ahorro al inicio y al final de mes",
    "herramienta": "ChatGPT",
    "prompt": "Comparar tres depósitos mensuales de $100.000 al 1 % efectivo mensual. Valorar ambas series al final del mes 3.",
    "respuestaIA": "Si los depósitos entran al final, ganan intereses durante 2, 1 y 0 meses. Si entran al inicio, ganan intereses durante 3, 2 y 1 meses.",
    "correccion": "Se verifican los exponentes de cada depósito y se compara el resultado con el selector de modalidad.",
    "resultadoFinal": "Vencida: $303.010,00. Anticipada: $306.040,10. Adelantar cada aporte un mes aumenta el ahorro final en $3.030,10.",
    "parteVisible": "Simulador → Anualidades → Valor futuro. Cambiar únicamente el selector Vencida/Anticipada.",
    "enlace": "https://chatgpt.com/share/6b021b88-6d98-83e9-add6-7188c61697f0",
    "conversacion": []
  },
  {
    "id": 6,
    "titulo": "Abono extraordinario para alcanzar una meta",
    "herramienta": "ChatGPT",
    "prompt": "Calcular cuánto aportar al final del mes 2 para reunir $500.000 al final del mes 3, con tres cuotas vencidas de $100.000 al 1 % mensual.",
    "respuestaIA": "Las cuotas reúnen $303.010. Al mes 3 faltan $196.990. El abono del mes 2 gana un mes de intereses: X × 1,01 = $196.990.",
    "correccion": "En la versión anterior faltaban los campos para ingresar la meta y el momento de X. El simulador corregido lleva el pago a la fecha objetivo antes de despejarlo.",
    "resultadoFinal": "X = $196.990 / 1,01 ≈ $195.039,60. Al multiplicarlo por 1,01 y sumar las cuotas acumuladas, se alcanzan los $500.000 al centavo.",
    "parteVisible": "Simulador → Anualidades → Pago adicional desconocido → Al final (VF). Seleccionar el periodo 2 para X.",
    "enlace": "https://chatgpt.com/share/6b021bbb-e398-83ea-a70f-36a9b1cec961",
    "conversacion": []
  }
]

export const THIRD_CUT_INTERACTIONS: Interaction[] = [
  {
    id: 7,
    titulo: "Gradientes · el primer aumento y el pago de hoy",
    herramienta: "ChatGPT",
    prompt: "Estoy verificando un simulador de matemáticas financieras. Deposito $100.000 al final del primer mes y hago cuatro depósitos mensuales. El aporte aumenta $10.000 cada dos cuotas. Además, deposito $20.000 hoy, en el momento cero. La tasa es del 1 % efectivo mensual. Construye la línea de tiempo y calcula el valor presente y el valor futuro al final del mes 4. Explícame en qué mes ocurre el primer aumento y cómo tratas el depósito de hoy.",
    respuestaIA: "Ordenó los pagos como $20.000 hoy, $100.000 en los meses 1 y 2 y $110.000 en los meses 3 y 4. Reportó $429.512,26 de VP y $446.952,18 de VF.",
    revision: "La línea de tiempo y los resultados coincidían. Faltaba mostrar cómo reproducir el caso con los campos del simulador.",
    correccion: "Reprodujimos los flujos en el simulador y documentamos los datos de entrada. El depósito de hoy entra por $20.000 en el VP y gana cuatro meses de interés para el VF. El primer cambio del gradiente llega en la cuota 3.",
    resultadoFinal: "VP de $429.512,26 y VF de $446.952,18 al cierre del mes 4.",
    parteVisible: "Tercer corte → Gradientes → Aritmético e Inversión. Ingresa $100.000 de primera cuota, cuatro cuotas mensuales, cambio de $10.000, dos cuotas por escalón y 1 % efectivo mensual vencido. En Agregar pago único, ingresa $20.000 en el periodo cero.",
    enlace: "https://chatgpt.com/share/6b025d5d-4334-83e9-931f-d7e94d54a514",
    conversacion: [],
  },
  {
    id: 8,
    titulo: "Perpetuidades · arriendo que sube cada dos meses",
    herramienta: "ChatGPT",
    prompt: "Un local paga $100.000 al final de cada mes de forma indefinida. El arriendo sube $1.000 cada dos meses. La tasa es del 2 % efectivo mensual. Escribe los primeros seis pagos y calcula el valor presente. Muestra cómo incorporas la frecuencia del aumento y comprueba el resultado sumando los primeros 600 pagos descontados.",
    respuestaIA: "Mostró dos pagos por cada monto, empezando en $100.000. Obtuvo $6.237.623,76 para todos los pagos y $6.237.476,87 al sumar los primeros 600.",
    revision: "La respuesta distinguía correctamente los dos valores. Faltaba mostrar cómo el campo Cuotas por escalón representa la frecuencia del aumento en el simulador.",
    correccion: "Recalculamos los primeros 600 flujos mes a mes. Comprobamos que los $146,89 de diferencia corresponden a los pagos desde el mes 601 y verificamos en el simulador el valor de la serie completa. Dos cuotas mensuales por escalón significan que el primer aumento llega en el mes 3.",
    resultadoFinal: "El VP de la perpetuidad es $6.237.623,76.",
    parteVisible: "Tercer corte → Perpetuidades → Aritmético e Inversión. Ingresa $100.000 de primera cuota mensual, cambio de $1.000, dos cuotas por escalón y 2 % efectivo mensual vencido.",
    enlace: "https://chatgpt.com/share/6b025d9e-9344-83e9-8f61-fed3370cbab4",
    conversacion: [],
  },
  {
    id: 9,
    titulo: "Amortización · gracia, abono y opción de compra",
    herramienta: "ChatGPT",
    prompt: "Un crédito de $1.000.000 al 1 % efectivo mensual tiene cuatro periodos en total. En el mes 1 hay gracia y solo pago intereses. Desde el mes 2 se amortiza por el sistema francés. Junto con la cuota del mes 2 hago un abono extraordinario de $100.000 a capital. El plazo se mantiene y no hay otros costos. Construye la tabla mes a mes, separa el abono extraordinario de la cuota ordinaria e indica desde qué mes cambia la cuota. Verifica el saldo final.",
    respuestaIA: "Calculó $10.000 de intereses en el mes de gracia, una cuota ordinaria de $340.022,11 en el mes 2 y cuotas de $289.270,87 desde el mes 3. La tabla separó el abono adicional de $100.000 y cerró con saldo de $0.",
    revision: "El crédito francés coincidió con la tabla. Al revisar otro caso de amortización, encontramos que el código de leasing generado por IA aplicaba el porcentaje de la opción de compra al desembolso.",
    seguimiento: {
      prompt: "Al revisar el código inicial del leasing generado con IA, encontramos que calculaba la opción de compra multiplicando el monto financiado por el porcentaje. Probemos un vehículo de $10.000.000, con $9.000.000 financiados y una opción de compra del 10 % sobre el valor inicial del vehículo. Muestra cuánto daba el código anterior, cuánto debe dar y por qué. Explica cómo el campo «Valor inicial del bien» corrige el cálculo en la pantalla de Amortización.",
      respuesta: "ChatGPT reprodujo los $900.000 del cálculo anterior y confirmó que la opción era de $1.000.000. Explicó cómo separar el precio del vehículo del capital inicial de la tabla.",
    },
    error: {
      valorIA: "$900.000 (10 % de $9.000.000 financiados)",
      valorCorrecto: "$1.000.000 (10 % de $10.000.000 del bien)",
      razon: "El enunciado aplica el 10 % al valor inicial del vehículo. El código inicial usaba el desembolso como base y dejaba la opción de compra $100.000 por debajo.",
    },
    correccion: "Añadimos el campo Valor inicial del bien. La opción se calcula con ese dato y la tabla de amortización comienza con los $9.000.000 financiados. En el caso francés también confirmamos que el pago del mes 2 suma la cuota ordinaria y el abono.",
    resultadoFinal: "En leasing, saldo final de $1.000.000 antes de pagar la opción. En el caso francés, pago de $440.022,11 en el mes 2, cuotas de $289.270,87 en los meses 3 y 4 y saldo final de $0.",
    parteVisible: "Tercer corte → Amortización → Francés → Leasing. Ingresa $9.000.000 de desembolso, $10.000.000 en Valor inicial del bien y 10 % de opción. La tabla termina con $1.000.000 en Saldo.",
    enlace: "https://chatgpt.com/share/6b0267d5-88b0-83e8-bb45-4975ce0078a8",
    conversacion: [],
  },
]
