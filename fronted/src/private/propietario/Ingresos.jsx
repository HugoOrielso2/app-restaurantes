import React, { useEffect, useState } from 'react'
import AsideOwner from './AsideOwner'
import { Global } from '../../helpers/Helpers'
import NavBarOwner from './NavBarOwner'
import TableIngresos from './tables/TableIngresos'

const Ingresos = () => {
  const [ ingresos , setIngresos ] = useState([])
  const [ingresosDeLaSemana,setIngresosDeLaSemana]=useState([])
  let totalSemana = 0
  const fechaActual = new Date()
  const year = fechaActual.getFullYear()
  const month = fechaActual.getMonth() + 1
  const day = fechaActual.getDate()
  let total = 0
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
  ingresos.forEach(ingreso=>{
    ingreso.total = parseFloat(ingreso.total)
    total = total + ingreso.total
  })

  ingresosDeLaSemana.forEach(ingreso=>{
    ingreso.total = parseFloat(ingreso.total)
    totalSemana = totalSemana + ingreso.total
  })
  useEffect(()=>{
    obtenerGanascias()
  },[])
  return (
    <>
    <NavBarOwner/>
    <section className='wrapper'>
    <AsideOwner/>
    <main>
        <section>
          <div className='info-table-ingresos'>
            <div className='fecha-ingresos-day'>
              <span className='fecha-today'> {`${year}/${month}/${day}`}</span>
              <p>Total del día: <strong>{total}</strong> </p>
            </div>
            <div className='cuadro-ingresos'>
              <p>Total de la semana: <strong>{totalSemana}</strong></p>
            </div>
          </div>
          <section className='table'>
            <TableIngresos dataIngresos={ingresos}/>
          </section>
        </section>
    </main>
  </section>  
  </>
)
}

export default Ingresos