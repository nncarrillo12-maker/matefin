import type { ReactNode } from "react"

export interface WorkedExample {
  enunciado: string
  datos: { label: string; value: string }[]
  pasos: { texto: string; calculo?: string }[]
  resultado: string
}

export interface InterestConcept {
  id: "simple" | "compuesto" | "continuo" | "conversion" | "anualidad-vencida" | "anualidad-anticipada"
  nombre: string
  tagline: string
  queEs: string
  comoFunciona: string
  // Tercer bloque: casos de uso o diferencia, según el tipo de interés.
  terceraPregunta: string
  terceraRespuesta: string
  formula: ReactNode
  formulaInteres: ReactNode
  variables: { simbolo: string; nombre: string }[]
  explicacionSencilla: string
  ejemplo: WorkedExample
}

export const CONCEPTS: InterestConcept[] = [
  {
    id: "simple",
    nombre: "Interés simple",
    tagline: "El premio se calcula siempre sobre lo que pusiste al principio.",
    queEs:
      "El interés simple es el dinero extra que ganas (o que pagas, si es un crédito) calculado únicamente sobre el capital inicial. No importa cuánto tiempo pase: la base para calcular el interés siempre es la misma cantidad, la que pusiste al comienzo.",
    comoFunciona:
      "En cada periodo se genera exactamente la misma cantidad de interés, porque siempre se calcula sobre el capital inicial (VP). Si guardas $100.000 a una tasa del 2% por periodo, cada periodo ganas $2.000, ni más ni menos. Al final sumas todos esos intereses al capital para obtener el valor futuro (VF).",
    terceraPregunta: "¿En qué casos se usa?",
    terceraRespuesta:
      "Se usa en operaciones de corto plazo: algunos créditos de consumo, préstamos entre personas, letras, pagarés y descuentos comerciales. También sirve para hacer estimaciones rápidas, porque es fácil de calcular mentalmente.",
    formula: (
      <>
        VF = VP · (1 + i · n)
      </>
    ),
    formulaInteres: <>I = VP · i · n</>,
    variables: [
      { simbolo: "VF", nombre: "Valor futuro (monto final)" },
      { simbolo: "VP", nombre: "Valor presente (capital inicial)" },
      { simbolo: "i", nombre: "Tasa de interés por periodo" },
      { simbolo: "n", nombre: "Número de periodos" },
      { simbolo: "I", nombre: "Interés ganado (ganancia neta)" },
    ],
    explicacionSencilla:
      "Imagina una alcancía mágica. Guardas 10 monedas y, cada noche, un ratón te regala 1 moneda por haber guardado esas 10. Siempre te regala 1, porque solo mira las 10 monedas del principio. Si pasan 5 noches, tendrás tus 10 monedas más 5 regaladas: 15 monedas.",
    ejemplo: {
      enunciado:
        "Inviertes $1.000.000 a una tasa de interés simple del 2% mensual durante 6 meses. ¿Cuánto tendrás al final y cuánto ganaste solo de intereses?",
      datos: [
        { label: "VP", value: "$ 1.000.000" },
        { label: "i", value: "2% mensual = 0,02" },
        { label: "n", value: "6 meses" },
      ],
      pasos: [
        { texto: "Calcula el interés total:", calculo: "I = 1.000.000 · 0,02 · 6 = $ 120.000" },
        { texto: "Suma el interés al capital:", calculo: "VF = 1.000.000 · (1 + 0,02 · 6) = 1.000.000 · 1,12" },
      ],
      resultado: "VF = $ 1.120.000 · Ganancia neta (intereses) = $ 120.000",
    },
  },
  {
    id: "compuesto",
    nombre: "Interés compuesto",
    tagline: "Los intereses también generan intereses: es una bola de nieve.",
    queEs:
      "El interés compuesto es el dinero extra que se calcula sobre el capital inicial y, además, sobre los intereses que ya se habían ganado antes. En cada periodo los intereses se suman al capital, y el periodo siguiente se calcula sobre ese total, cada vez más grande.",
    comoFunciona:
      "Al final de cada periodo, el interés ganado se 'reinvierte': se junta con el capital y pasa a formar parte de la base del siguiente cálculo. Por eso el dinero crece cada vez más rápido. Este efecto se conoce como capitalización.",
    terceraPregunta: "¿Por qué es diferente al interés simple?",
    terceraRespuesta:
      "En el interés simple la base nunca cambia: siempre es el capital inicial. En el compuesto la base crece periodo a periodo, porque los intereses se acumulan. A corto plazo la diferencia es pequeña, pero con el tiempo el compuesto genera muchísimo más dinero.",
    formula: (
      <>
        VF = VP · (1 + i)<sup>n</sup>
      </>
    ),
    formulaInteres: (
      <>
        I = VP · [ (1 + i)<sup>n</sup> − 1 ]
      </>
    ),
    variables: [
      { simbolo: "VF", nombre: "Valor futuro (monto final)" },
      { simbolo: "VP", nombre: "Valor presente (capital inicial)" },
      { simbolo: "i", nombre: "Tasa de interés por periodo" },
      { simbolo: "n", nombre: "Número de periodos" },
      { simbolo: "I", nombre: "Interés ganado (ganancia neta)" },
    ],
    explicacionSencilla:
      "Vuelve la alcancía mágica, pero ahora el ratón es más generoso: cada noche te regala 1 moneda por cada 10 que haya en la alcancía… incluidas las que ya te regaló. Como cada vez hay más monedas, cada noche te regala un poquito más que la anterior.",
    ejemplo: {
      enunciado:
        "Inviertes $1.000.000 a una tasa de interés compuesto del 2% mensual durante 6 meses. ¿Cuánto tendrás al final?",
      datos: [
        { label: "VP", value: "$ 1.000.000" },
        { label: "i", value: "2% mensual = 0,02" },
        { label: "n", value: "6 meses" },
      ],
      pasos: [
        { texto: "Aplica la fórmula de capitalización:", calculo: "VF = 1.000.000 · (1 + 0,02)^6" },
        { texto: "Eleva a la potencia:", calculo: "VF = 1.000.000 · 1,126162" },
      ],
      resultado: "VF = $ 1.126.162,42 · Ganancia neta (intereses) = $ 126.162,42",
    },
  },
  {
    id: "continuo",
    nombre: "Interés continuo",
    tagline: "El dinero crece a cada instante, sin parar.",
    queEs:
      "El interés continuo es el caso extremo del interés compuesto: en lugar de capitalizar una vez al mes o al año, capitaliza infinitas veces, en cada instante del tiempo. Se calcula con el número e (aproximadamente 2,71828), la base del crecimiento natural.",
    comoFunciona:
      "Imagina que en vez de sumar los intereses al final del mes, los sumas cada segundo, y luego cada milésima de segundo, y así infinitamente. En ese límite el crecimiento se vuelve 'continuo' y se describe con la función exponencial e^(i·n). Por convención del curso, el tiempo n se expresa siempre en años.",
    terceraPregunta: "¿Cuál es la diferencia frente al interés compuesto?",
    terceraRespuesta:
      "El interés compuesto capitaliza en periodos definidos (cada mes, cada año). El continuo capitaliza en cada instante, un número infinito de veces. Con la misma tasa nominal, el continuo produce un poquito más que el compuesto, porque nunca deja de generar intereses.",
    formula: (
      <>
        VF = VP · e<sup>(i · n)</sup>
      </>
    ),
    formulaInteres: (
      <>
        I = VP · ( e<sup>(i · n)</sup> − 1 )
      </>
    ),
    variables: [
      { simbolo: "VF", nombre: "Valor futuro (monto final)" },
      { simbolo: "VP", nombre: "Valor presente (capital inicial)" },
      { simbolo: "e", nombre: "Número de Euler ≈ 2,71828" },
      { simbolo: "i", nombre: "Tasa de interés anual" },
      { simbolo: "n", nombre: "Tiempo en años" },
    ],
    explicacionSencilla:
      "La alcancía mágica ahora no espera a la noche para darte monedas: te da un pedacito de moneda todo el tiempo, sin descanso, mañana, tarde y noche. Al final del día juntaste un montoncito, un poquito más grande que si te las diera solo por la noche.",
    ejemplo: {
      enunciado:
        "Inviertes $1.000.000 a una tasa de interés continuo del 10% anual durante 2 años. ¿Cuánto tendrás al final?",
      datos: [
        { label: "VP", value: "$ 1.000.000" },
        { label: "i", value: "10% anual = 0,10" },
        { label: "n", value: "2 años" },
      ],
      pasos: [
        { texto: "Aplica la fórmula continua:", calculo: "VF = 1.000.000 · e^(0,10 · 2)" },
        { texto: "Calcula el exponente y la potencia:", calculo: "VF = 1.000.000 · e^0,20 = 1.000.000 · 1,221403" },
      ],
      resultado: "VF = $ 1.221.402,76 · Ganancia neta (intereses) = $ 221.402,76",
    },
  },
  {
    id: "conversion",
    nombre: "Conversión de tasas",
    tagline: "Ponemos tasas distintas en el mismo idioma.",
    queEs:
      "Convertir una tasa es cambiar su forma de contar el interés sin cambiar la realidad del negocio. Así puedes comparar una tasa nominal con una efectiva y saber cuánto cuesta o cuánto crece el dinero.",
    comoFunciona:
      "Primero miras cada cuánto se capitaliza la tasa: mensual, trimestral o semestralmente. Luego repartes la tasa nominal entre esos periodos y aplicas interés compuesto para obtener la tasa efectiva. Si capitaliza más seguido, el resultado efectivo suele ser un poco mayor.",
    terceraPregunta: "¿Nominal, efectiva, anticipada o vencida?",
    terceraRespuesta:
      "La nominal anuncia una tasa anual que todavía debe dividirse por sus capitalizaciones. La efectiva muestra lo que realmente pasa en todo el periodo. Una tasa vencida se cobra al final del periodo; una anticipada se descuenta al comienzo, como ocurre en algunos descuentos comerciales.",
    formula: (
      <>
        i efectiva = (1 + j/m)<sup>m</sup> − 1
      </>
    ),
    formulaInteres: <>i periodo = j/m</>,
    variables: [
      { simbolo: "j", nombre: "Tasa nominal anual" },
      { simbolo: "m", nombre: "Capitalizaciones por año" },
      { simbolo: "i", nombre: "Tasa efectiva anual o periódica" },
    ],
    explicacionSencilla:
      "Imagina que te dicen que una tasa es del 12 % nominal anual con capitalización mensual. Suena complicado, pero lo único que significa es: el banco parte ese 12 % en 12 meses y cada mes te cobra el 1 %. Como cada mes ese 1 % se suma al total, al final del año terminas pagando un poquito más del 12 %. Ese poquito más es la tasa efectiva.",
    ejemplo: {
      enunciado:
        "Una familia colombiana recibe una tasa del 12 % nominal anual con capitalización mensual para ahorrar $2.000.000 durante un año. ¿Cuál es la tasa efectiva y el valor final?",
      datos: [
        { label: "VP", value: "$ 2.000.000" },
        { label: "j", value: "12% nominal anual" },
        { label: "m", value: "12 meses" },
      ],
      pasos: [
        { texto: "Divide la tasa nominal entre los 12 meses:", calculo: "i mensual = 0,12 / 12 = 0,01 = 1%" },
        { texto: "Convierte a tasa efectiva anual:", calculo: "EA = (1 + 0,01)^12 − 1 = 12,68%" },
        { texto: "Calcula el ahorro al final del año:", calculo: "VF = 2.000.000 · (1,01)^12 = $ 2.253.649" },
      ],
      resultado: "La tasa efectiva es 12,68% anual y el ahorro termina en aproximadamente $ 2.253.649.",
    },
  },
  {
    id: "anualidad-vencida",
    nombre: "Anualidad vencida",
    tagline: "La cuota se paga al final de cada periodo.",
    queEs:
      "Una anualidad vencida es una fila de pagos iguales que se hacen cada cierto tiempo, como las cuotas de un crédito, los aportes a un fondo o un arriendo pagado al terminar el mes.",
    comoFunciona:
      "Cada pago ocurre al final del mes, por eso el primer pago no alcanza a ganar interés durante ese mismo mes. Para conocer el valor futuro llevas cada pago hasta la fecha final. Para conocer el valor presente traes cada pago hasta hoy.",
    terceraPregunta: "¿Qué pasa con un abono extra?",
    terceraRespuesta:
      "Un depósito adicional no deja de ser parte del ahorro: se calcula aparte y se lleva a la fecha final con interés compuesto. En un crédito, un abono extraordinario puede reducir el saldo y los intereses futuros, según las condiciones del banco.",
    formula: (
      <>
        VF = R · [((1 + i)<sup>n</sup> − 1) / i]
      </>
    ),
    formulaInteres: (
      <>
        VP = R · [1 − (1 + i)<sup>−n</sup>] / i
      </>
    ),
    variables: [
      { simbolo: "R", nombre: "Pago igual de cada periodo" },
      { simbolo: "i", nombre: "Tasa por periodo" },
      { simbolo: "n", nombre: "Número de pagos" },
      { simbolo: "VF", nombre: "Valor futuro de los pagos" },
      { simbolo: "VP", nombre: "Valor presente de los pagos" },
    ],
    explicacionSencilla:
      "Es como poner una moneda en una alcancía al final de cada mes. La primera moneda tiene mucho tiempo para crecer y la última casi no tiene tiempo. Juntas, todas forman un ahorro grande.",
    ejemplo: {
      enunciado:
        "Una persona aporta $200.000 al final de cada mes a un ahorro programado que paga 1% mensual durante 6 meses. ¿Cuánto tendrá?",
      datos: [
        { label: "R", value: "$ 200.000" },
        { label: "i", value: "1% mensual = 0,01" },
        { label: "n", value: "6 meses" },
      ],
      pasos: [
        { texto: "Identifica que es vencida: el aporte entra al final del mes.", calculo: "R = 200.000; i = 0,01; n = 6" },
        { texto: "Reemplaza en la fórmula de valor futuro:", calculo: "VF = 200.000 · [(1,01^6 − 1) / 0,01]" },
        { texto: "Calcula el resultado:", calculo: "VF = 200.000 · 6,152 = $ 1.230.403" },
      ],
      resultado: "Al final tendrá aproximadamente $ 1.230.403. Sin intereses habría ahorrado $ 1.200.000.",
    },
  },
  {
    id: "anualidad-anticipada",
    nombre: "Anualidad anticipada",
    tagline: "La cuota se paga al inicio de cada periodo.",
    queEs:
      "Una anualidad anticipada es una serie de pagos iguales hechos al comenzar cada periodo. Es común en arriendos, leasing, matrículas y pólizas de seguro: pagas primero y luego recibes el uso o la protección.",
    comoFunciona:
      "Como cada pago entra un periodo antes que en una anualidad vencida, cada pago tiene un mes extra para crecer. Por eso, con los mismos pagos, tasa y número de periodos, el valor futuro y el valor presente son mayores.",
    terceraPregunta: "¿Dónde la encuentras en la vida real?",
    terceraRespuesta:
      "El arriendo suele pagarse al inicio del mes, igual que una cuota de leasing, una matrícula o una póliza de seguro. La diferencia clave es el momento: anticipada significa primero el pago; vencida significa primero termina el periodo y luego pagas.",
    formula: (
      <>
        VF = R · [((1 + i)<sup>n</sup> − 1) / i] · (1 + i)
      </>
    ),
    formulaInteres: (
      <>
        VP = R · [1 − (1 + i)<sup>−n</sup>] / i · (1 + i)
      </>
    ),
    variables: [
      { simbolo: "R", nombre: "Pago igual al inicio" },
      { simbolo: "i", nombre: "Tasa por periodo" },
      { simbolo: "n", nombre: "Número de pagos" },
      { simbolo: "VF", nombre: "Valor futuro de los pagos" },
      { simbolo: "VP", nombre: "Valor presente de los pagos" },
    ],
    explicacionSencilla:
      "Es como pagar la entrada al parque antes de jugar. Como cada moneda entra un poquito antes, tiene más tiempo para crecer que una moneda puesta al final.",
    ejemplo: {
      enunciado:
        "Un arriendo de $800.000 se paga al inicio de cada mes durante 6 meses. La tasa de referencia es 1% mensual. ¿Cuál es su valor futuro al mes 6?",
      datos: [
        { label: "R", value: "$ 800.000" },
        { label: "i", value: "1% mensual = 0,01" },
        { label: "n", value: "6 pagos al inicio" },
      ],
      pasos: [
        { texto: "Calcula primero la anualidad vencida equivalente:", calculo: "800.000 · [(1,01^6 − 1) / 0,01] = $ 4.921.610" },
        { texto: "Multiplica por (1 + i), porque cada pago entra un mes antes:", calculo: "VF anticipada = 4.921.610 · 1,01" },
        { texto: "Obtén el valor final:", calculo: "VF anticipada = $ 4.970.826" },
      ],
      resultado: "El valor futuro es aproximadamente $ 4.970.826, mayor que el de una anualidad vencida por el mes extra de crecimiento.",
    },
  },
]
