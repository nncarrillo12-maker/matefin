import type { ReactNode } from "react"

const tablaSistemas = [
  ["Francés", "$507.512,44", "$507.512,44", "$15.024,88"],
  ["Alemán", "$510.000,00", "$505.000,00", "$15.000,00"],
  ["Americano con pago de intereses", "$10.000,00", "$1.010.000,00", "$20.000,00"],
  ["Americano con capitalización", "$0,00", "$1.020.100,00", "$20.100,00"],
]

export const THIRD_CUT_CONCEPTS = [
  {
    id: "gradientes",
    nombre: "Gradientes",
    tagline: "Las cuotas suben o bajan en pesos o en porcentaje.",
    contenido: (
      <>
          <p>Imagina que cada año guardas dinero en una alcancía. Si vas cambiando lo que guardas, tienes una anualidad con <strong>gradiente</strong>. El gradiente mide cuánto cambia la cuota. En una anualidad de cuota fija guardas la misma cantidad cada vez. Eso equivale a un gradiente de cero.</p>
          <p>En el <strong>aritmético</strong> sumas o restas siempre la misma cantidad en pesos. En el <strong>geométrico</strong> aplicas un porcentaje a la cuota anterior. Si los precios suben un 2 % en el año, subir tu aporte en ese mismo porcentaje conserva el poder de compra de ese aporte frente a esos precios. A igualdad de tasa, plazo y primera cuota, subir los aportes aumenta el VP y el VF, y bajarlos reduce ambos.</p>
          <h3 className="font-semibold">Cómo se calcula</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Cuota aritmética = A + s × G. A es la primera cuota, s cuenta los ajustes aplicados y G es el cambio en pesos.</li>
            <li>Cuota geométrica = A × (1 + g)<sup>s</sup>. g es el cambio en decimal. Un aumento del 2 % se escribe 0,02 y una disminución del 2 % se escribe −0,02.</li>
            <li>Si el cambio ocurre cada k cuotas, s es la parte entera de (t − 1) / k, donde t es el número de la cuota. Si pagas mensualmente y el ajuste es anual, las primeras 12 cuotas son iguales y el cambio llega en el mes 13. Cuando no se indica una frecuencia distinta, el ajuste va con cada cuota y k vale 1.</li>
            <li>Para el <strong>valor presente</strong> (VP), divide cada cuota por (1 + i)<sup>t</sup> y suma. Para el <strong>valor futuro</strong> (VF), multiplica cada cuota por (1 + i)<sup>n − t</sup> y suma. i es la tasa efectiva por cuota y n es el número total de cuotas. Usamos interés compuesto para llevar cada pago a la misma fecha.</li>
          </ul>
          <h3 className="font-semibold">Ejemplo de ahorro en Bogotá</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Una familia guarda $100.000 al final del primer año. Aporta durante tres años al 5 % efectivo anual. Si aumenta $10.000 por año, sus cuotas son $100.000, $110.000 y $120.000.</li>
            <li>Trae cada aporte a hoy dividiéndolo por 1,05 elevado al año en que se paga. El VP es <strong>$298.671,85</strong>.</li>
            <li>Lleva los aportes al final del tercer año. El primero gana intereses durante dos años, el segundo durante uno y el tercero llega al final. El VF es $100.000 × 1,05² + $110.000 × 1,05 + $120.000 = <strong>$345.750</strong>.</li>
            <li>Si el aumento fuera del 2 % anual, las cuotas serían $100.000, $102.000 y $104.040. Repitiendo el traslado hasta el año 3, el VF sería <strong>$321.390</strong>. Una disminución de $10.000 por año daría cuotas de $100.000, $90.000 y $80.000, con un VF de <strong>$284.750</strong>.</li>
          </ol>
          <p className="text-sm text-muted-foreground">La guía del proyecto exige cuotas positivas y, para el gradiente geométrico finito, una tasa efectiva por escalón superior al crecimiento. El Excel de clase permite calcular el caso de crecimiento mensual del 1,5 % con una tasa mensual del 1,259049 %. En el proyecto, ese caso se bloquea por la regla de la guía.</p>
      </>
    ),
  },
  {
    id: "perpetuidades",
    nombre: "Perpetuidades",
    tagline: "Los pagos siguen para siempre.",
    contenido: (
      <>
          <p>Imagina que un local te paga arriendo cada mes para siempre. Una <strong>perpetuidad</strong> es una anualidad sin última cuota. También sirve para representar los pagos indefinidos de un fondo de dotación o de una inversión que reparte rendimientos. Puedes calcular su valor hoy. Para calcular el valor futuro de todos los pagos necesitarías una fecha final, y siempre queda otro pago por llegar.</p>
          <p>Un pago que llega muy lejos en el tiempo vale menos hoy. A una tasa del 1 % mensual, un millón que llega dentro de 50 años vale <strong>$2.553,73</strong> hoy, porque se divide por 1,01<sup>600</sup>. Cuando los pagos son constantes, cada uno vale menos que el anterior al traerlo a hoy. La suma se acerca a un límite. Pasa lo mismo si juntas media unidad, luego un cuarto, luego un octavo y sigues sumando porciones cada vez más pequeñas. El total se acerca a una unidad.</p>
          <h3 className="font-semibold">Cómo se calcula</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Pago constante: VP = A / i. A es el primer pago, recibido al final del primer periodo, e i es la tasa efectiva por cuota en decimal.</li>
            <li>Ajuste aritmético: VP = (A + G / j) / i. G es el aumento en pesos cada k cuotas y j = (1 + i)<sup>k</sup> − 1 es la tasa efectiva del bloque.</li>
            <li>Ajuste geométrico: VP = (A / i) / (1 − g / j), donde g es el aumento porcentual por bloque en decimal. Al pasar de un bloque al siguiente, los pagos crecen con el factor 1 + g y su descuento crece con el factor 1 + j. El valor descontado de cada bloque se multiplica por (1 + g) / (1 + j). Para que los bloques sean cada vez más pequeños y su suma se acerque a un valor finito, esa fracción debe ser menor que 1. Eso ocurre cuando j es mayor que g.</li>
          </ul>
          <h3 className="font-semibold">Ejemplo de un local en Colombia</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>El local paga $1.000.000 cada mes y la tasa es del 1 % mensual. Divide $1.000.000 por 0,01. El VP es <strong>$100.000.000</strong>. Si inviertes ese valor al 1 % mensual, genera $1.000.000 cada mes y puedes retirar ese interés conservando el capital.</li>
            <li>Si el arriendo aumenta $1.000 cada mes, k = 1 y j = 0,01. Sustituye y divide (1.000.000 + 1.000 / 0,01) por 0,01. El VP sube a <strong>$110.000.000</strong>.</li>
            <li>Si aumenta 0,2 % cada mes, g = 0,002. Con k = 1, la fórmula se reduce a A / (i − g). Divide $1.000.000 por 0,008. El VP es <strong>$125.000.000</strong>.</li>
          </ol>
      </>
    ),
  },
  {
    id: "amortizacion",
    nombre: "Amortización",
    tagline: "Cada pago muestra cómo cambia lo que debes.",
    contenido: (
      <>
          <p>Si te prestan dinero, cada pago puede devolver una parte de lo prestado. Eso es <strong>amortizar</strong>. La tabla te muestra cuánto pagas por usar el dinero, cuánto devuelves, qué cargos adicionales pagas y cuánto debes después.</p>
          <h3 className="font-semibold">Cómo se calcula cada fila</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>Interés del periodo = saldo anterior × i. i es la tasa efectiva vencida por cuota. Si dejas que el interés se sume a la deuda, ese saldo más alto genera interés en el siguiente periodo. Así se ve el interés compuesto en la tabla.</li>
            <li>Abono ordinario a capital = cuota total menos intereses, otros costos y abono extraordinario. Saldo nuevo = saldo anterior menos los abonos ordinario y extraordinario.</li>
            <li><strong>Francés</strong>. La cuota financiera C se paga al final de cada periodo y es fija mientras se mantienen la tasa y el plazo del tramo. Es una anualidad vencida. Se calcula C = P × i / [1 − (1 + i)<sup>−n</sup>], donde P es el saldo al iniciar el tramo y n son las cuotas restantes. Si i es cero, C = P / n. La parte de la cuota que va a intereses es mayor al inicio que al final. A medida que baja el saldo, cae el interés y crece el abono a capital.</li>
            <li><strong>Alemán</strong>. El abono ordinario a capital es P / n en cada cuota. La cuota financiera es ese abono más el interés del periodo y baja al disminuir el saldo.</li>
            <li><strong>Americano</strong>. El capital queda para el final. Con pago de intereses, antes del vencimiento pagas P × i y en la última cuota pagas P × (1 + i). Con capitalización, el saldo crece durante n periodos y el único pago financiero es P × (1 + i)<sup>n</sup>. Si hay costos periódicos en la modalidad de pago único, el simulador los suma al pago final sin cobrar intereses sobre esos costos.</li>
          </ul>
          <h3 className="font-semibold">Ejemplo con el saldo de un crédito de vivienda</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Una familia colombiana debe $1.000.000 y le quedan dos meses. La tasa es del 1 % mensual y no hay otros costos. En el primer mes se generan $10.000 de intereses.</li>
            <li>En francés, la fórmula da una cuota de $507.512,44. Después de pagar los $10.000 de intereses, el primer abono a capital es $497.512,44 y queda un saldo de <strong>$502.487,56</strong>.</li>
            <li>En alemán, el primer abono es $500.000. La primera cuota es $510.000 y quedan $500.000. Al segundo mes, el interés baja a $5.000 y la cuota es $505.000.</li>
            <li>En americano con pago de intereses, los $10.000 del primer mes dejan la deuda en $1.000.000. Con capitalización, se suman al saldo, que sube a $1.010.000 y genera otros $10.100 de interés en el segundo mes.</li>
          </ol>
          <div className="overflow-x-auto">
            <table className="w-full min-w-max text-left text-sm">
              <caption className="sr-only">Comparación de los cuatro planes de pago para el crédito de vivienda</caption>
              <thead className="bg-secondary"><tr>
                <th scope="col" className="p-2">Sistema</th><th scope="col" className="p-2">Primera cuota</th><th scope="col" className="p-2">Segunda cuota</th><th scope="col" className="p-2">Interés total</th>
              </tr></thead>
              <tbody>{tablaSistemas.map(([sistema, primera, segunda, interes]) => (
                <tr className="border-b" key={sistema}>
                  <th scope="row" className="p-2 font-medium">{sistema}</th><td className="p-2">{primera}</td><td className="p-2">{segunda}</td><td className="p-2">{interes}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          <p>En este ejemplo, el alemán paga menos intereses porque devuelve capital más rápido. Puede encajar si puedes asumir cuotas iniciales más altas. El francés facilita presupuestar una cuota estable. El americano con capitalización tiene el primer pago más bajo. Puede encajar si esperas recibir al vencimiento el dinero necesario para cubrir la última cuota.</p>
      </>
    ),
  },
  {
    id: "cambios-credito",
    nombre: "Cambios del crédito, costo real y leasing",
    tagline: "Revisa cómo cambian la cuota y el costo de un crédito.",
    contenido: (
      <>
          <p>Si cambian las condiciones del crédito, vuelve a calcular desde el saldo que quede en ese momento. Así puedes saber cómo cambia lo que vas a pagar.</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>En una <strong>gracia inicial</strong> de tres meses, la amortización comienza en el mes 4. Durante la gracia puedes pagar intereses o sumarlos al saldo. En un crédito de 24 meses quedan 21 periodos para calcular la cuota francesa.</li>
            <li>Si haces un <strong>abono extraordinario</strong> con la cuota 14, descuéntalo del saldo de esa fila. En el francés con plazo fijo, calcula la nueva cuota desde la 15 con el saldo reducido y el número de pagos restantes.</li>
            <li>Si hay <strong>compra de cartera desde la cuota 16</strong>, toma el saldo después de la cuota 15. Aplica a partir de la 16 la nueva tasa y los nuevos costos.</li>
          </ul>
          <h3 className="font-semibold">Ejemplo de costo real con seguro</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Para un crédito francés de $1.000.000 a cuatro meses al 1 % mensual, calcula la cuota financiera. Resulta <strong>$256.281,09</strong>.</li>
            <li>Suma el seguro de $8.000 por mes. Pagarás <strong>$264.281,09</strong>. Anota el millón recibido en positivo y las cuatro cuotas pagadas en negativo.</li>
            <li>La TIR periódica es la tasa r que iguala el monto recibido con la suma de las cuotas descontadas. Al dividir el pago del mes t por (1 + r)<sup>t</sup> y sumar los cuatro valores, el resultado debe ser $1.000.000. La TIR es aproximadamente 2,259731 % mensual. Con m = 12 cuotas por año, la fórmula EA = (1 + r)<sup>m</sup> − 1 da <strong>30,754229 % EA</strong>.</li>
          </ol>
          <h3 className="font-semibold">Ejemplo de leasing de un vehículo para una empresa</h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Una empresa financia un vehículo por $10.000.000 con dos cánones mensuales al 1 % y una opción de compra del 10 %. Esa opción, R, vale <strong>$1.000.000</strong> al final del mes 2.</li>
            <li>Trae R a hoy dividiéndola por (1 + i)<sup>n</sup>, donde i = 0,01 y n = 2 meses. Su VP es <strong>$980.296,05</strong>. Resta ese VP del desembolso para hallar lo que deben cubrir los cánones.</li>
            <li>Aplica la fórmula francesa a los $9.019.703,95 que deben cubrir los cánones. Cada canon es <strong>$4.577.611,94</strong>. Después del segundo canon queda el saldo de la opción. Si se ejerce, el último flujo incluye el canon y el millón de la opción de compra.</li>
          </ol>
      </>
    ),
  },
] as const satisfies readonly {
  id: string
  nombre: string
  tagline: string
  contenido: ReactNode
}[]
