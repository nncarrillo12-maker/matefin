"use client"

import { useState, type FormEvent, type ReactNode } from "react"
import { RATE_PERIODS, convertRate, periodsPerYear, type RatePeriod, type RateMode, type RateKind } from "@/lib/rates"
import { serie, tabla, costoEA, exigir, type Sistema, type Serie } from "@/lib/tercer-corte"

const moneda = new Intl.NumberFormat("es-CO", {style:"currency", currency:"COP", minimumFractionDigits:2})
const pesos = (v:number) => moneda.format(v)
const porcentaje = (v:number) => v.toLocaleString("es-CO",{style:"percent",maximumFractionDigits:6})
const caja = "rounded-xl border border-border bg-card p-5 space-y-4"
const rejilla = "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
const control = "mt-1 block w-full rounded-md border border-input bg-background px-3 py-2"
const sistemas: Sistema[] = ["Francés","Alemán","Americano"]
function Numero({nombre,etiqueta,valor=0,entero=false}:{nombre:string;etiqueta:string;valor?:number;entero?:boolean}){
  return <label>{etiqueta}<input className={control} required type="number" step={entero ? 1 : "any"} name={nombre} defaultValue={valor}/></label>
}
function Selector({nombre,etiqueta,opciones,valor,cambio}:{nombre:string;etiqueta:string;opciones:string[];valor?:string;cambio?:(v:string)=>void}){
  return <label>{etiqueta}<select className={control} name={nombre} defaultValue={valor} onChange={e=>cambio?.(e.target.value)}>{opciones.map(x=><option key={x}>{x}</option>)}</select></label>
}
function Periodo({nombre,inicial}:{nombre:string;inicial:RatePeriod}){
  const [periodo,setPeriodo]=useState(inicial)
  return <><label>Periodicidad<select className={control} name={nombre} value={periodo} onChange={e=>setPeriodo(e.target.value as RatePeriod)}>{RATE_PERIODS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}</select></label>{periodo==="custom" && <Numero nombre={nombre+"Meses"} etiqueta="Meses por periodo" valor={1}/>}</>
}
function Tasa({prefijo}:{prefijo:string}){
  return <fieldset className={caja}><legend>{prefijo==="nueva" ? "Tasa de la compra de cartera" : "Tasa de interés"}</legend><div className={rejilla}><Numero nombre={prefijo} etiqueta="Tasa (%)" valor={12}/><Selector nombre={prefijo+"Tipo"} etiqueta="Tipo" opciones={["efectiva","nominal"]}/><Selector nombre={prefijo+"Modo"} etiqueta="Modalidad" opciones={["vencida","anticipada"]}/><Periodo nombre={prefijo+"Periodo"} inicial="anual"/></div></fieldset>
}
function Cuadro({titulos,datos}:{titulos:string[];datos:(string|number)[][]}){
  return <div className="max-h-96 overflow-auto"><table className="w-full text-right text-sm"><thead className="sticky top-0 bg-secondary"><tr>{titulos.map(t=><th className="whitespace-nowrap p-2" key={t}>{t}</th>)}</tr></thead><tbody>{datos.map((fila,j)=><tr key={j} className="border-b">{fila.map((x,k)=><td key={k} className="whitespace-nowrap p-2">{x}</td>)}</tr>)}</tbody></table></div>
}
const temas=["Gradientes","Perpetuidades","Amortización"]
function Calculadora({tema}:{tema:string}){
  const deuda=tema===temas[2], infinita=tema===temas[1]
  const [tipo,setTipo]=useState<Serie>(infinita?"Constante":"Aritmético")
  const [sistema,setSistema]=useState<Sistema>("Francés")
  const [opciones,setOpciones]=useState<string[]>([])
  const [extras,setExtras]=useState<number[]>([])
  const [resultado,mostrar]=useState<ReactNode>(null)
  const activo=(op:string)=>opciones.includes(op)
  const opcion=(op:string)=><label key={op} className="flex items-center gap-2"><input type="checkbox" checked={activo(op)} onChange={e=>setOpciones(e.target.checked?[...opciones,op]:opciones.filter(v=>v!==op))}/>{op}</label>
  function calcular(e:FormEvent<HTMLFormElement>){
    e.preventDefault()
    const f=new FormData(e.currentTarget)
    const str=(k:string)=>String(f.get(k)??"")
    const num=(k:string)=>Number(str(k))
    const periodo=str("pago") as RatePeriod
    function tasa(k:string){
      return convertRate({rate:num(k)/100,kind:str(k+"Tipo") as RateKind,mode:str(k+"Modo") as RateMode,period:str(k+"Periodo") as RatePeriod,customMonths:num(k+"PeriodoMeses")},{kind:"efectiva",mode:"vencida",period:periodo,customMonths:num("pagoMeses")})
    }
    try{
      const i=tasa("tasa"), n=num("n")
      if (!infinita) exigir(n<=10000,"Para mostrar este ejercicio usa hasta 10.000 cuotas.")
      let contenido:ReactNode
      if(!deuda){
        const g=tipo==="Geométrico"?num("g")/100:num("g")
        const {vp,vf}=serie(tipo,infinita,num("a"),g,num("k")||(!f.has("k")?1:0),i,n,extras.map(id=>({monto:num("extra"+id),periodo:num("t"+id)})),num("fijo"),f.has("cada")?num("cada"):1)
        contenido=<><h3>{str("operacion")==="Crédito"?"Valor de los pagos del crédito":"Valor de los aportes de la inversión"}</h3><p>Valor presente <strong>{pesos(vp)}</strong></p>{vf!==null && <p>Valor futuro <strong>{pesos(vf)}</strong></p>}</>
      }else{
        const frances=sistema==="Francés", leasing=frances && activo("Leasing")
        if(leasing) exigir(num("opcion")>0 && num("opcion")<100,"La opción debe estar entre 0 y 100 % del bien.")
        const datos={sistema,capital:num("capital"),n,i,otros:num("otros"),residual:leasing?num("capital")*num("opcion")/100:0,gracia:num("gracia"),capitalizar:str("variante")==="Capitalizar intereses",abono:num("abono"),momento:num("momento"),compra:num("compra"),nueva:f.has("nueva")?tasa("nueva"):i,costos:num("costos")}
        if(f.has("compra")) exigir(datos.compra>=1,"Indica la primera cuota de la compra de cartera.")
        const filas=tabla(datos)
        const pagos=filas.slice(1).map(r=>r.cuota)
        pagos[pagos.length-1]+=datos.residual
        const final=filas[filas.length-1].saldo
        const comparacion=sistemas.map(s=>{
          const base=tabla({...datos,sistema:s,gracia:0,residual:0,abono:0,compra:0,capitalizar:s==="Americano" && datos.capitalizar})
          return [s,pesos(base[1].cuota),pesos(base.reduce((a,r)=>a+r.interes,0)),pesos(base.reduce((a,r)=>a+r.cuota,0))]
        })
        contenido=<><p>Costo efectivo anual real <strong>{porcentaje(costoEA(datos.capital,pagos,periodsPerYear(periodo,num("pagoMeses"))))}</strong></p><p>Saldo final <strong>{pesos(final)}</strong> · Objetivo {pesos(datos.residual)} · {Math.abs(final-datos.residual)<0.005?"Verificado":"Revisar"}</p>{leasing && <p>El costo real incluye ejercer la opción de compra al vencimiento.</p>}<Cuadro titulos={["n","Cuota total","Interés","Otros","Abono a capital",...(datos.abono?["Abono adicional"]:[]),"Saldo"]} datos={filas.map(r=>[r.t,pesos(r.cuota),pesos(r.interes),pesos(r.otros),pesos(r.amort),...(datos.abono?[pesos(r.extra)]:[]),pesos(r.saldo)])}/><h3>Comparación del crédito base</h3><p>Mismo desembolso, plazo, tasa y costos iniciales. Los eventos se aplican en la tabla superior.</p><Cuadro titulos={["Sistema","Primera cuota","Intereses","Total pagado"]} datos={comparacion}/></>
      }
      mostrar(<section className={caja} aria-live="polite"><p>Tasa efectiva vencida por cuota <strong>{porcentaje(i)}</strong></p>{contenido}</section>)
    }catch(err){mostrar(<p role="alert" className="rounded-md border p-3 text-destructive">{err instanceof Error?err.message:"Revisa los datos."}</p>)}
  }
  return <form onSubmit={calcular} className="space-y-5" onChange={()=>mostrar(null)}><fieldset className={caja}><legend>{tema}</legend><div className={rejilla}>
  {deuda?<Selector etiqueta="Sistema del crédito" nombre="sistema" opciones={sistemas} cambio={s=>setSistema(s as Sistema)}/>:<><Selector nombre="operacion" etiqueta="Operación" opciones={["Inversión","Crédito"]}/><Selector nombre="tipo" etiqueta="Serie de pagos vencidos" opciones={infinita?["Constante","Aritmético","Geométrico"]:["Aritmético","Geométrico"]} cambio={s=>setTipo(s as Serie)}/></>}
  <Numero nombre={deuda?"capital":"a"} etiqueta={deuda?"Desembolso (COP)":"Primera cuota (COP)"} valor={deuda?10000000:100000}/>
  {!infinita && <Numero nombre="n" etiqueta="Número total de cuotas" entero valor={12}/>}
  <Periodo nombre="pago" inicial="mensual"/>
  {!deuda && tipo!=="Constante" && <><Numero key={tipo} nombre="g" etiqueta={tipo==="Geométrico"?"Cambio por escalón (%)":"Cambio por escalón (COP)"} valor={tipo==="Geométrico"?0.5:1000}/><Numero nombre="k" etiqueta="Cuotas por escalón" entero valor={1}/></>}
  {deuda && <Numero nombre="otros" etiqueta="Otros costos por cuota (COP)"/>}</div></fieldset><Tasa prefijo="tasa"/>
  {!infinita && !deuda && <fieldset className={caja}><legend>Pagos adicionales</legend><div className={rejilla}><Numero nombre="fijo" etiqueta="Adicional recurrente (COP)"/><Numero nombre="cada" etiqueta="Cada cuántas cuotas" entero valor={1}/></div>{extras.map(id=><div className={rejilla} key={id}><Numero nombre={"extra"+id} etiqueta="Pago único (COP)"/><Numero nombre={"t"+id} etiqueta="Periodo (0 = hoy)" entero/><button type="button" onClick={()=>{setExtras(extras.filter(x=>x!==id));mostrar(null)}}>Quitar pago</button></div>)}<button type="button" className="underline" onClick={()=>{setExtras([...extras,(extras.at(-1)??0)+1]);mostrar(null)}}>Agregar pago único</button></fieldset>}
  {deuda && <fieldset className={caja}><legend>Condiciones del crédito</legend><div className={rejilla}>{(sistema==="Francés"?["Leasing","Gracia inicial","Abono extraordinario","Compra de cartera"]:sistema==="Alemán"?["Compra de cartera"]:[]).map(opcion)}</div><div className={rejilla}>
  {sistema==="Francés" && activo("Leasing") && <Numero nombre="opcion" etiqueta="Opción de compra (% del valor inicial)" valor={10}/>}
  {sistema==="Francés" && activo("Gracia inicial") && <Numero nombre="gracia" etiqueta="Cuotas iniciales de gracia" entero valor={1}/>}
  {(sistema==="Americano" || sistema==="Francés" && activo("Gracia inicial")) && <Selector nombre="variante" etiqueta="Tratamiento de intereses" opciones={["Pagar intereses","Capitalizar intereses"]}/>}
  {sistema==="Francés" && activo("Abono extraordinario") && <><Numero nombre="abono" etiqueta="Abono adicional (COP)" valor={100000}/><Numero nombre="momento" etiqueta="Se paga junto con la cuota" entero valor={2}/></>}
  {sistema!=="Americano" && activo("Compra de cartera") && <><Numero nombre="compra" etiqueta="Primera cuota con tasa nueva" entero valor={3}/><Numero nombre="costos" etiqueta="Nuevos costos por cuota (COP)"/></>}</div>
  {sistema!=="Americano" && activo("Compra de cartera") && <Tasa prefijo="nueva"/>}</fieldset>}
  <button className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Calcular</button>{resultado}</form>
}
export default function TercerCorte(){
  const [tema,seleccionar]=useState(temas[0])
  return <main className="mx-auto max-w-6xl space-y-6 px-4 py-10"><h1 className="font-display text-3xl font-bold">Cuotas, inversiones y créditos</h1><nav aria-label="Simuladores del tercer corte" className="flex flex-wrap gap-2">{temas.map(t=><button key={t} aria-pressed={tema===t} onClick={()=>seleccionar(t)} className={"rounded-lg border px-4 py-2 "+(tema===t?"bg-primary text-primary-foreground":"bg-card")}>{t}</button>)}</nav><Calculadora key={tema} tema={tema}/></main>
}
