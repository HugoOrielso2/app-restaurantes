import React, { useEffect, useState } from 'react'
import AsideOwner from './AsideOwner'
import NavBarOwner from './NavBarOwner'
import TableGastos from './tables/TableGastos'
import ModalGastos from './ModalGastos'
import { Global } from '../../helpers/Helpers'
import '/public/css/balance.css'
import PedidosEnCursoRecepcionista from '../employee/recepcionista/PedidosEnCursoRecepcionista'
const Gastos = () => {
    const [gastos, setGastos] = useState([])
    const [gastosDeLaSemana,setGastosDeLaSemana]= useState([])
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
    let totalSemana = 0
    gastosDeLaSemana.forEach(gasto=>{
        totalSemana = totalSemana + parseInt(gasto.monto)
    })
    const [modalGasto,setModalGasto] = useState(false)
    let totalGastos =0
    gastos.forEach(gasto=>{
        gasto.monto = parseInt(gasto.monto)
        totalGastos = totalGastos + gasto.monto
    })
    function toggleModalGastos(){
        setModalGasto(true)
    }
    useEffect(()=>{
        obtenerGastos()
    },[])

  return (
    <>
    <NavBarOwner/>
    <section className='wrapper'>
        <AsideOwner/>
        <main>
            <div className='header-gasto'>
                <button className='add-product' onPointerDown={toggleModalGastos}>Registrar gastos</button>
                <div className='fecha-ingresos-day'><span style={{color: "red"}}>Gastos totales del día:</span>  <strong>{totalGastos}</strong> </div>
                <div className='fecha-ingresos-day'><span style={{color: "red"}}>Gastos de la semana:</span>  <strong>{totalSemana}</strong> </div>
            </div>
            <section className='gastos'>
                <TableGastos gastos={gastos}/>
            </section>
        </main>

        {modalGasto && <ModalGastos abrir={setModalGasto}/>}
    </section>
    </>
  )
}

export default Gastos
