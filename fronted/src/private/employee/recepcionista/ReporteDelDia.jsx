import React, { useEffect, useState } from 'react'
import NavRecepcionista from './NavRecepcionista'
import { Global } from '../../../helpers/Helpers'
import TableReporte from './TableReporte'
import '/public/css/reportes.css'
const ReporteDelDia = () => {
    let ganancias = 0
    const [datosReportados,setDatosReportados]= useState([])
    async function ajusteCaja(){
        const request = await fetch(Global.url + 'empleado/reporte/general',{
            method: "GET",
            headers: {
                "content-type":"application/json",
                "Authorization": localStorage.getItem("token")
            }
        })
        const data = await request.json()
        if(data.status=="success"){
            setDatosReportados(data.rows)
        }
    }
    datosReportados.forEach(dato=>{
        ganancias = parseInt(ganancias) + parseInt(dato.total)
    })
    useEffect(()=>{
        ajusteCaja()
    },[])
  return (
    <>
        <NavRecepcionista/>
        <main>
            <section className='mini-header'>
                <div>
                    Ingresos: {ganancias}
                </div>
            </section>
            <section>
                <TableReporte data={datosReportados}/>
            </section>
        </main>
    </>
  )
}

export default ReporteDelDia