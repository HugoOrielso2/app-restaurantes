import React, { useEffect, useState } from 'react'
import AsideOwner from './AsideOwner'
import { Global } from '../../helpers/Helpers'
import NavBarOwner from './NavBarOwner'
import TableGastos from './tables/TableGastos'
import TableIngresos from './tables/TableIngresos'
import '/public/css/balance.css'
const Balance = () => {
  let totalGastos = 0
  let totalIngresos = 0
  let totalSemana = 0
  let balance = 0
  let gastosTotalesDeLaSemana=0
  const [ ingresos , setIngresos ] = useState([])
  const [ingresosDeLaSemana, setIngresosDeLaSemana] = useState([])
  const [gastosDeLaSemana,setGastosDeLaSemana] = useState([])
  const [gastos,setGastos] = useState([])
  gastos.forEach(gasto=>{
    totalGastos = totalGastos + gasto.monto
  })
  ingresos.forEach(ingreso=>{
    totalIngresos = totalIngresos + parseInt(ingreso.total)
  })
  ingresosDeLaSemana.forEach(ingreso=>{
    totalSemana = totalSemana + parseInt(ingreso.total)
  })
  gastosDeLaSemana.forEach(gasto=>{
    gastosTotalesDeLaSemana = gastosTotalesDeLaSemana + parseInt(gasto.monto)
  })
  balance = totalIngresos - totalGastos
  async function obtenerGastos(){
    const request = await fetch(Global.url + "propietario/gastos", {
        method: "GET",
        headers: {
          "content-type": "application/json",
          "Authorization": localStorage.getItem("token")
        }
    })
    const data = await request.json()
    if(data.status == "success"){
      setGastos(data.gastos)
      setGastosDeLaSemana(data.gastosSemana)
    }
  }
  const obtenerGanascias = async ()=>{
    const request = await fetch(Global.url + "propietario/ganancias", {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    
    if(data.status=="success"){
      setIngresos(data.rows)
      setIngresosDeLaSemana(data.ingresosSemana)
    }
  }
  useEffect(()=>{
    obtenerGastos()
    obtenerGanascias()
  },[])
  return (
    <>
    <NavBarOwner/>
    <section className='wrapper'>
      <AsideOwner/>
      <main>
        <section className='container-data-balance'>
          <div className='cuadro-ingresos'>
            <p> <strong>Ingresos de la semana:</strong>  <strong style={{color: "green"}}>{totalSemana}</strong></p>
          </div>
          <div className='cuadro-ingresos'>
            <p> <strong>Gastos de la semana:</strong>  <strong style={{color: "red"}}>{gastosTotalesDeLaSemana}</strong></p>
          </div>
          <div className='cuadro-ingresos'>
            <p> <strong>Balance de la semana:</strong>  <strong className={`${balance < 0 ? "negativo-p" : "positivo-p"}`}>{totalSemana}</strong></p>
          </div>
        </section>
        <section>  
          <div className='container-bills-profits'>
            <div className='container-table'>
              <TableGastos gastos={gastos}/>
            </div>
            <div className='container-table'>
              <TableIngresos dataIngresos={ingresos}/>
            </div>
          </div>
          <div className={`balance-div ${balance < 0 ? "negativo" : "positivo"}`}>
            <div className='cuadro-ingresos'>
              <p> <strong>Gastos del día:</strong>  <strong style={{color: "red"}}>{totalGastos}</strong></p>
            </div>
            <div className='cuadro-ingresos'>
              <p> <strong>Ingresos del día:</strong>  <strong style={{color: "green"}}>{totalIngresos}</strong></p>
            </div>
            <div className='cuadro-ingresos'>
              <p> <strong>Balance del día:</strong>  <strong className={`${balance < 0 ? "negativo-p" : "positivo-p"}`}>{balance}</strong></p>
            </div>
          </div>
        </section>
      </main>
    </section>
  </>
  )
}

export default Balance