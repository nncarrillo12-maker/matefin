"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { formatMoney, parseNumber } from "@/lib/format"
import { RATE_PERIODS, convertRate, periodsPerYear, type RatePeriod, type RateMode, type RateKind } from "@/lib/rates"
import { serie, tabla, costoEA, exigir, type Sistema, type Serie } from "@/lib/tercer-corte"

const pesos = (v:number) => formatMoney(v, "COP")
const porcentaje = (v:number) => v.toLocaleString("es-CO",{style:"percent",maximumFractionDigits:6})
const caja = "min-w-0 rounded-2xl border border-border bg-card p-5 space-y-4 sm:p-6"
const rejilla = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
const control = "mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
const sistemas: Sistema[] = ["Francés","Alemán","Americano"]
function Numero({nombre,etiqueta,valor=0,entero=false,opcional=false}:{nombre:string;etiqueta:string;valor?:number | "";entero?:boolean;opcional?:boolean}){
  return <label>{etiqueta}<input className={control} required={!opcional} inputMode={entero ? "numeric" : "decimal"} name={nombre} defaultValue={valor}/></label>
}
function Selector({nombre,etiqueta,opciones,valor,cambio}:{nombre:string;etiqueta:string;opciones:string[];valor?:string;cambio?:(v:string)=>void}){
  return <label>{etiqueta}<select className={control} name={nombre} defaultValue={valor} onChange={e=>cambio?.(e.target.value)}>{opciones.map(x=><option key={x}>{x}</option>)}</select></label>
}
function Periodo({nombre,inicial}:{nombre:string;inicial:RatePeriod}){
  const [periodo,setPeriodo]=useState(inicial)
  return <><label>Periodicidad<select className={control} name={nombre} value={periodo} onChange={e=>setPeriodo(e.target.value as RatePeriod)}>{RATE_PERIODS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select></label>{periodo==="custom" && <Numero nombre={nombre+"Meses"} etiqueta="Meses por periodo" valor={1}/>}</>
}
function Tasa({prefijo, valor=12, periodoInicial="anual"}:{prefijo:string;valor?:number;periodoInicial?:RatePeriod}){
  return <fieldset className={caja}><legend>{prefijo==="nueva" ? "Tasa de la compra de cartera" : "Tasa de interés"}</legend><div className={rejilla}><Numero nombre={prefijo} etiqueta="Tasa (%)" valor={valor}/><Selector nombre={prefijo+"Tipo"} etiqueta="Tipo" opciones={["efectiva","nominal"]}/><Selector nombre={prefijo+"Modo"} etiqueta="Modalidad" opciones={["vencida","anticipada"]}/><Periodo nombre={prefijo+"Periodo"} inicial={periodoInicial}/></div></fieldset>
}
function Cuadro({titulos,datos}:{titulos:string[];datos:(string|number)[][]}){
  return <div className="max-h-96 overflow-auto"><table className="w-full text-right text-sm"><thead className="sticky top-0 bg-secondary"><tr>{titulos.map(t=><th className="whitespace-nowrap p-2" key={t}>{t}</th>)}</tr></thead><tbody>{datos.map((fila,j)=><tr key={j} className="border-b">{fila.map((x,k)=><td key={k} className="whitespace-nowrap p-2">{x}</td>)}</tr>)}</tbody></table></div>
}
function Resumen({datos}:{datos:{titulo:string;valor:string;detalle?:string}[]}){
  return (
    <dl className="grid gap-3 sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]">
      {datos.map(({titulo,valor,detalle})=>(
        <div key={titulo} className="min-w-0 rounded-xl border border-border bg-secondary/50 p-4">
          <dt className="text-sm font-medium text-muted-foreground">{titulo}</dt>
          <dd className="mt-1 break-words font-display text-xl font-bold tabular-nums text-foreground sm:text-2xl">{valor}</dd>
          {detalle && <dd className="mt-1 text-sm text-muted-foreground">{detalle}</dd>}
        </div>
      ))}
    </dl>
  )
}

const temas = ["Gradientes", "Perpetuidades", "Amortización"] as const
type Tema = typeof temas[number]
type Ejemplo = {
  nombre: string
  tasa: number
  primeraCuota?: number
  plazo?: number
  cambio?: number
  escalon?: number
  pagoHoy?: number
  capital?: number
  gracia?: number
  abono?: number
  momentoAbono?: number
}
const ejemplos: Record<Tema, Ejemplo> = {
  Gradientes: { nombre: "Ahorro con aporte inicial", tasa: 1, primeraCuota: 100000, plazo: 4, cambio: 10000, escalon: 2, pagoHoy: 20000 },
  Perpetuidades: { nombre: "Arriendo que sube cada dos meses", tasa: 2, primeraCuota: 100000, cambio: 1000, escalon: 2 },
  Amortización: { nombre: "Crédito francés con gracia y abono", tasa: 1, capital: 1000000, plazo: 4, gracia: 1, abono: 100000, momentoAbono: 2 },
}

function Calculadora({tema, ejemplo}:{tema:Tema;ejemplo?:Ejemplo}){
  const deuda=tema===temas[2], infinita=tema===temas[1]
  const [tipo,setTipo]=useState<Serie>(infinita && !ejemplo?"Constante":"Aritmético")
  const [sistema,setSistema]=useState<Sistema>("Francés")
  const [opciones,setOpciones]=useState<string[]>(ejemplo?.gracia ? ["Gracia inicial", "Abono extraordinario"] : [])
  const [extras,setExtras]=useState<{id:number;monto:number}[]>(ejemplo?.pagoHoy ? [{id:1,monto:ejemplo.pagoHoy}] : [])
  const [resultado,mostrar]=useState<ReactNode>(null)
  const opcionesDisponibles = sistema === "Francés"
    ? ["Leasing", "Gracia inicial", "Abono extraordinario", "Compra de cartera"]
    : sistema === "Alemán" ? ["Compra de cartera"] : []
  const opcionesActivas = opcionesDisponibles.filter(opcion => opciones.includes(opcion))
  const activo=(op:string)=>opciones.includes(op)
  const opcion=(op:string)=><label key={op} className="flex items-center gap-2"><input type="checkbox" checked={activo(op)} onChange={e=>setOpciones(e.target.checked?[...opciones,op]:opciones.filter(v=>v!==op))}/>{op}</label>
  function calcular(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f=new FormData(e.currentTarget)
    const str = (nombre: string) => String(f.get(nombre) ?? "").trim()
    function num(nombre: string, esMonto = false) {
      const valor = str(nombre)
      if (valor === "") return 0
      const tieneMiles = esMonto && /^[+-]?\d{1,3}(?:\.\d{3})+$/.test(valor)
      const numero = tieneMiles || valor.includes(",") ? parseNumber(valor) : Number(valor)
      exigir(Number.isFinite(numero), "Revisa los datos numéricos. Puedes escribir los montos como 1.000.000,50 y las tasas como 1,5.")
      return numero
    }
    const periodo=str("pago") as RatePeriod
    function tasa(k:string){
      return convertRate({rate:num(k)/100,kind:str(k+"Tipo") as RateKind,mode:str(k+"Modo") as RateMode,period:str(k+"Periodo") as RatePeriod,customMonths:num(k+"PeriodoMeses")},{kind:"efectiva",mode:"vencida",period:periodo,customMonths:num("pagoMeses")})
    }
    try{
      const i=tasa("tasa"), n=num("n")
      if (!infinita) exigir(n<=10000,"Para mostrar este ejercicio usa hasta 10.000 cuotas.")
      let contenido:ReactNode
      if(!deuda){
        const g=tipo==="Geométrico"?num("g")/100:num("g", true)
        const cuotasPorEscalon = str("k") === "" ? 1 : num("k")
        const {vp,vf}=serie(tipo,infinita,num("a", true),g,cuotasPorEscalon,i,n,extras.map(({id})=>({monto:num("extra"+id, true),periodo:num("t"+id)})),num("fijo", true),f.has("cada")?num("cada"):1)
        contenido = <>
          <h2 className="font-display text-lg font-bold">{str("operacion")==="Crédito"?"Valor de los pagos del crédito":"Valor de los aportes de la inversión"}</h2>
          <Resumen datos={[
            {titulo:"Valor presente (VP)",valor:pesos(vp)},
            ...(vf === null ? [] : [{titulo:"Valor futuro (VF)",valor:pesos(vf)}]),
          ]}/>
        </>
      }else{
        const frances=sistema==="Francés", leasing=frances && activo("Leasing")
        if(leasing) exigir(num("opcion")>0 && num("opcion")<100,"La opción debe estar entre 0 y 100 % del bien.")
        const capital = num("capital", true)
        const valorBien = str("valorBien") === "" ? capital : num("valorBien", true)
        if (leasing) exigir(valorBien > 0 && Number.isFinite(valorBien), "Ingresa un valor inicial positivo para el bien.")
        const datos={sistema,capital,n,i,otros:num("otros", true),residual:leasing?valorBien*num("opcion")/100:0,gracia:num("gracia"),capitalizar:str("variante")==="Capitalizar intereses",abono:num("abono", true),momento:num("momento"),compra:num("compra"),nueva:f.has("nueva")?tasa("nueva"):i,costos:num("costos", true)}
        if(f.has("compra")) exigir(datos.compra>=1,"Indica la primera cuota de la compra de cartera.")
        const filas=tabla(datos)
        const pagos = filas.slice(1).map(fila => fila.cuota + (fila.t === n ? datos.residual : 0))
        const flujos = [datos.capital, ...pagos.map(pago => pago === 0 ? 0 : -pago)]
        const final=filas[filas.length-1].saldo
        const americanoPagoUnico = sistema === "Americano" && datos.capitalizar
        const comparacion=sistemas.map(s=>{
          const base=tabla({...datos,sistema:s,gracia:0,residual:0,abono:0,compra:0,capitalizar:s==="Americano" && americanoPagoUnico})
          const nombre = s === "Americano" ? (americanoPagoUnico ? "Americano con pago único" : "Americano con pago de intereses") : s
          return [nombre,pesos(base[1].cuota),pesos(base.reduce((a,r)=>a+r.interes,0)),pesos(base.reduce((a,r)=>a+r.cuota,0))]
        })
        const costoReal = costoEA(datos.capital, pagos, periodsPerYear(periodo, num("pagoMeses")))
        const saldoVerificado = Math.abs(final - datos.residual) < 0.005
        contenido = <>
          <h2 className="font-display text-lg font-bold">Resultado del crédito</h2>
          <Resumen datos={[
            {titulo:"Primera cuota",valor:pesos(filas[1].cuota)},
            {titulo:"Costo real (EA)",valor:porcentaje(costoReal)},
            {
              titulo:"Saldo final",valor:pesos(final),
              detalle:leasing
                ? `Opción de compra de ${pesos(datos.residual)} · ${saldoVerificado ? "Verificado" : "Revisar saldo"}`
                : saldoVerificado ? "Crédito saldado" : "Revisar saldo",
            },
          ]}/>
          {datos.compra > 0 && <p>Desde la cuota {datos.compra}, la tasa efectiva vencida por cuota es <strong>{porcentaje(datos.nueva)}</strong>.</p>}
          <p className="text-sm text-muted-foreground">La TIR usa la columna «Flujo de efectivo». El desembolso entra en positivo y los pagos salen en negativo.{leasing && " En el último periodo, el flujo incluye la opción de compra. La columna Saldo muestra cuánto queda por pagar antes de ejercerla."}</p>
          {datos.capitalizar && <p className="text-sm text-muted-foreground">Un abono a capital negativo en un periodo sin pago de intereses indica que esos intereses aumentaron el saldo.</p>}
          {americanoPagoUnico && datos.otros > 0 && <p className="text-sm text-muted-foreground">Los otros costos de cada periodo se cobran juntos en el pago final, sin generar intereses.</p>}
          {datos.abono > 0 && datos.momento === n && <p className="text-sm text-muted-foreground">En la última cuota, el abono adicional cubre parte del capital que ya vence ese día. El total de la cuota se mantiene.</p>}
          <h3 className="font-display font-semibold">Tabla de amortización</h3>
          <Cuadro
            titulos={["n", "Cuota total", "Interés", "Otros", "Abono a capital", ...(datos.abono ? ["Abono adicional"] : []), "Saldo", "Flujo de efectivo"]}
            datos={filas.map(fila => [
              fila.t, pesos(fila.cuota), pesos(fila.interes), pesos(fila.otros), pesos(fila.amort),
              ...(datos.abono ? [pesos(fila.extra)] : []), pesos(fila.saldo),
              pesos(flujos[fila.t]),
            ])}
          />
          <h3 className="font-display font-semibold">Comparación del crédito base</h3>
          <p>Mismo desembolso, plazo, tasa y costos iniciales. Los eventos se aplican en la tabla superior.</p>
          <Cuadro titulos={["Sistema", "Primera cuota", "Intereses", "Total pagado"]} datos={comparacion}/>
        </>
      }
      mostrar(<section className={caja} aria-live="polite">
        <p className="text-sm text-muted-foreground">Tasa efectiva vencida por cuota <strong>{porcentaje(i)}</strong></p>
        {contenido}
      </section>)
    }catch(err){mostrar(<p role="alert" className="rounded-md border p-3 text-destructive">{err instanceof Error?err.message:"Revisa los datos."}</p>)}
  }
  return (
    <form onSubmit={calcular} className="space-y-5" onChange={()=>mostrar(null)}>
      <fieldset className={caja}>
        <legend className="font-display font-semibold">Datos de la operación</legend>
        <div className={rejilla}>
          {deuda ? (
            <Selector etiqueta="Sistema del crédito" nombre="sistema" opciones={sistemas} cambio={s=>setSistema(s as Sistema)}/>
          ) : (
            <>
              <Selector nombre="operacion" etiqueta="Operación" opciones={["Inversión","Crédito"]}/>
              <Selector nombre="tipo" etiqueta={infinita ? "Tipo de perpetuidad vencida" : "Tipo de gradiente vencido"} opciones={infinita ? ["Constante","Aritmético","Geométrico"] : ["Aritmético","Geométrico"]} valor={tipo} cambio={s=>setTipo(s as Serie)}/>
            </>
          )}
          <Numero nombre={deuda ? "capital" : "a"} etiqueta={deuda ? "Desembolso (COP)" : "Primera cuota (COP)"} valor={deuda ? ejemplo?.capital ?? 10000000 : ejemplo?.primeraCuota ?? 100000}/>
          {!infinita && <Numero nombre="n" etiqueta="Número total de cuotas" entero valor={ejemplo?.plazo ?? 12}/>}
          <Periodo nombre="pago" inicial="mensual"/>
          {!deuda && tipo!=="Constante" && (
            <>
              <Numero key={tipo} nombre="g" etiqueta={tipo==="Geométrico" ? "Cambio por escalón (%)" : "Cambio por escalón (COP)"} valor={tipo==="Geométrico" ? 0.5 : ejemplo?.cambio ?? 1000}/>
              <Numero nombre="k" etiqueta="Cuotas por escalón (opcional)" entero opcional valor={ejemplo?.escalon ?? 1}/>
            </>
          )}
          {deuda && <Numero nombre="otros" etiqueta="Otros costos por cuota (COP)"/>}
          {deuda && sistema==="Americano" && <Selector nombre="variante" etiqueta="Tratamiento de intereses" opciones={["Pagar intereses","Capitalizar intereses"]}/>}
        </div>
        {!deuda && tipo!=="Constante" && (
          <p className="text-sm text-muted-foreground">Si el campo queda vacío, el ajuste se aplica en cada cuota a partir de la segunda. Para cuotas mensuales con ajuste anual, escribe 12. El primer ajuste llega en la cuota 13.</p>
        )}
      </fieldset>
      <Tasa prefijo="tasa" valor={ejemplo?.tasa} periodoInicial={ejemplo ? "mensual" : "anual"}/>

      {!infinita && !deuda && (
        <fieldset className={caja}>
          <legend className="font-display font-semibold">Pagos adicionales</legend>
          <div className={rejilla}>
            <Numero nombre="fijo" etiqueta="Adicional recurrente (COP)"/>
            <Numero nombre="cada" etiqueta="Cada cuántas cuotas" entero valor={1}/>
          </div>
          {extras.map(({id,monto})=>(
            <div className={rejilla} key={id}>
              <Numero nombre={"extra"+id} etiqueta="Pago único (COP)" valor={monto}/>
              <Numero nombre={"t"+id} etiqueta="Periodo (0 = hoy)" entero/>
              <button type="button" onClick={()=>{setExtras(extras.filter(x=>x.id!==id));mostrar(null)}}>Quitar pago</button>
            </div>
          ))}
          <button type="button" className="underline" onClick={()=>{setExtras([...extras,{id:(extras.at(-1)?.id ?? 0)+1,monto:0}]);mostrar(null)}}>
            Agregar pago único
          </button>
        </fieldset>
      )}

      {deuda && opcionesDisponibles.length>0 && (
        <details className="rounded-2xl border border-border bg-card" onInvalid={event=>{event.currentTarget.open=true}}>
          <summary className="cursor-pointer rounded-2xl px-5 py-4 font-display font-semibold">
            Opciones avanzadas
            {opcionesActivas.length>0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">Activas · {opcionesActivas.join(", ")}</span>
            )}
          </summary>
          <div className="space-y-4 border-t border-border p-5 sm:p-6">
            <div className={rejilla}>{opcionesDisponibles.map(opcion)}</div>
            {opcionesActivas.length>0 && (
              <div className={rejilla}>
                {sistema==="Francés" && activo("Leasing") && (
                  <>
                    <Numero nombre="opcion" etiqueta="Opción de compra (% del valor inicial)" valor={10}/>
                    <Numero nombre="valorBien" etiqueta="Valor inicial del bien (COP, opcional)" valor="" opcional/>
                    <p className="self-end text-sm text-muted-foreground">Si dejas el valor del bien vacío, se usa el monto del desembolso.</p>
                  </>
                )}
                {sistema==="Francés" && activo("Gracia inicial") && (
                  <>
                    <Numero nombre="gracia" etiqueta="Cuotas iniciales de gracia" entero valor={ejemplo?.gracia ?? 1}/>
                    <Selector nombre="variante" etiqueta="Tratamiento de intereses" opciones={["Pagar intereses","Capitalizar intereses"]}/>
                    <p className="self-end text-sm text-muted-foreground">Incluye los periodos de gracia en el número total de cuotas.</p>
                  </>
                )}
                {sistema==="Francés" && activo("Abono extraordinario") && (
                  <>
                    <Numero nombre="abono" etiqueta="Abono adicional (COP)" valor={ejemplo?.abono ?? 100000}/>
                    <Numero nombre="momento" etiqueta="Se paga junto con la cuota" entero valor={ejemplo?.momentoAbono ?? 2}/>
                  </>
                )}
                {activo("Compra de cartera") && (
                  <>
                    <Numero nombre="compra" etiqueta="Primera cuota con tasa nueva" entero valor={3}/>
                    <Numero nombre="costos" etiqueta="Nuevos costos por cuota (COP)"/>
                  </>
                )}
              </div>
            )}
            {activo("Compra de cartera") && <Tasa prefijo="nueva"/>}
          </div>
        </details>
      )}

      <button className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Calcular</button>
      {resultado}
    </form>
  )
}

export default function TercerCorte(){
  const [tema,seleccionar]=useState<Tema>(temas[0])
  const [ejemploCargado,cargarEjemplo]=useState(0)

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <h1 className="font-display text-3xl font-bold">Cuotas, inversiones y créditos</h1>
      <nav aria-label="Simuladores del tercer corte" className="flex flex-wrap gap-2">
        {temas.map(t=>(
          <button
            type="button"
            key={t}
            aria-pressed={tema===t}
            onClick={()=>{
              if(tema===t) return
              seleccionar(t)
              cargarEjemplo(0)
            }}
            className={"rounded-lg border px-4 py-2 "+(tema===t ? "bg-primary text-primary-foreground" : "bg-card")}
          >
            {t}
          </button>
        ))}
      </nav>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={()=>cargarEjemplo(numero=>numero+1)} className="rounded-md border border-border bg-card px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary">
          Cargar ejemplo
        </button>
        <p role="status" className="text-sm text-muted-foreground">
          {ejemploCargado>0 ? `${ejemplos[tema].nombre}. Pulsa Calcular para ver el resultado.` : ejemplos[tema].nombre}
        </p>
      </div>
      <Calculadora key={`${tema}-${ejemploCargado}`} tema={tema} ejemplo={ejemploCargado>0 ? ejemplos[tema] : undefined}/>
    </div>
  )
}
