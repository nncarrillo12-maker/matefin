import type { ReactNode } from "react"

export interface WorkedExample {
  enunciado: string
  datos: { label: string; value: string }[]
  pasos: { texto: string; calculo?: string }[]
  resultado: string
}

export interface InterestConcept {
  id: "simple" | "compuesto" | "continuo"
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
]
