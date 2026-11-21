export function exigir(ok: boolean, mensaje: string) {
  if (!ok) throw new Error(mensaje)
}
export function plazo(n: number) {
  exigir(Number.isSafeInteger(n) && n > 0, "Ingresa un número entero positivo de periodos.")
}
export type Serie = "Constante" | "Aritmético" | "Geométrico"
type Extra = { periodo: number; monto: number }
export function serie(tipo: Serie, perpetua: boolean, a: number, g: number, k: number, i: number, n: number, extras: Extra[], fijo: number, cada: number) {
  plazo(k)
  exigir(a > 0 && Number.isFinite(i) && i >= 0, "Revisa la primera cuota y la tasa.")
  const bloque = Math.expm1(k * Math.log1p(i))
  if (tipo === "Geométrico") exigir(bloque - g > 1e-12 * Math.max(Math.abs(g), Math.abs(bloque)), "La tasa efectiva del bloque debe superar el crecimiento geométrico.")
  if (perpetua) {
    exigir(i > 0 && (tipo === "Constante" || g > 0), "Se requiere interés positivo y, si hay crecimiento, un gradiente positivo.")
    const vp = tipo === "Geométrico" ? a / i / (1 - g / bloque) : (a + (tipo === "Aritmético" ? g / bloque : 0)) / i
    exigir(Number.isFinite(vp), "El valor excede el rango de cálculo.")
    return { vp, vf: null }
  }
  plazo(n); plazo(cada)
  exigir(fijo >= 0 && extras.every(e => Number.isInteger(e.periodo) && e.periodo >= 0 && e.periodo <= n && e.monto >= 0), "Revisa los montos y periodos de los pagos adicionales.")
  let vp = extras.reduce((s,e) => s + e.monto / (1+i)**e.periodo, 0)
  for (let t = 1; t <= n; t++) {
    const paso = Math.floor((t-1)/k)
    const base = tipo === "Geométrico" ? a*(1+g)**paso : a+g*paso
    exigir(base > 0, "La cuota del periodo " + t + " debe ser positiva antes de sumar adicionales.")
    vp += (base + (t % cada === 0 ? fijo : 0)) / (1+i)**t
  }
  const vf = vp*(1+i)**n
  exigir(Number.isFinite(vf), "El valor excede el rango de cálculo.")
  return { vp, vf }
}

export type Sistema = "Francés" | "Alemán" | "Americano"
export type Prestamo = { sistema: Sistema; capital: number; n: number; i: number; otros: number; residual: number; gracia: number; capitalizar: boolean; abono: number; momento: number; compra: number; nueva: number; costos: number }
export function tabla(p: Prestamo) {
  const {capital,n,residual,sistema,gracia} = p
  plazo(n)
  exigir(capital > 0 && residual >= 0 && residual < capital && Number.isInteger(gracia) && gracia >= 0 && gracia < n, "Revisa el monto, la opción de compra y el plazo de gracia.")
  exigir([p.i,p.otros,p.abono,p.nueva,p.costos].every(x=>Number.isFinite(x) && x>=0), "Tasas, costos y abonos deben ser valores válidos y no negativos.")
  exigir(!p.compra || (Number.isInteger(p.compra) && p.compra>=1 && p.compra<=n), "La compra de cartera debe estar dentro del plazo.")
  exigir(!p.abono || (Number.isInteger(p.momento) && p.momento>=1 && p.momento<=n), "Revisa el periodo del abono.")
  let saldo = capital
  const filas = [{t:0, cuota:0, interes:0, otros:0, amort:0, extra:0, saldo}]
  for (let t=1;t<=n;t++) {
    const cambio = p.compra > 0 && t >= p.compra
    const i = cambio ? p.nueva : p.i
    const otros = cambio ? p.costos : p.otros
    const interes = saldo*i
    const quedan = n-t+1
    let amort = 0
    if (t===n) amort = saldo-residual
    else if (t<=gracia || sistema==="Americano") amort = p.capitalizar ? -interes : 0
    else if (sistema==="Alemán" || i===0) amort = (saldo-residual)/quedan
    else amort = (saldo-residual)*i / -Math.expm1(-quedan*Math.log1p(i)) + residual*i - interes
    const extra = t===p.momento ? p.abono : 0
    exigir(extra <= saldo-amort-residual+1e-7, "El abono adicional supera el capital disponible después de la cuota.")
    saldo -= amort+extra
    const cuota = amort+interes+otros+extra
    exigir(Number.isFinite(cuota) && Number.isFinite(saldo), "La tabla excede el rango de cálculo.")
    filas.push({t,cuota,interes,otros,amort,extra,saldo})
  }
  return filas
}
export function costoEA(capital: number, pagos: number[], frecuencia: number) {
  const vp = (r:number) => pagos.reduceRight((v,c)=>(v+c)/(1+r),0)
  if (Math.abs(vp(0)-capital) < 1e-8) return 0
  let bajo=0, alto=1
  while (vp(alto)>capital) alto*=2
  for(let j=0;j<100;j++){
    const medio=(bajo+alto)/2
    if(vp(medio)>capital) bajo=medio
    else alto=medio
  }
  return Math.expm1(frecuencia*Math.log1p((bajo+alto)/2))
}
