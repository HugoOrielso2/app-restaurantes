import React, { useEffect, useState } from 'react'
import NavRecepcionista from './NavRecepcionista'
import TableReporteDomicilios from './TableReporteDomicilios'
import { Global } from '../../../helpers/Helpers'

const ReporteDomicilios = () => {
    const [datosReportados,setDatosReportados]= useState([])
    async function ajusteCaja(){
        const request = await fetch(Global.url + 'empleado/reporte/domicilios',{
            method: "GET",
            headers: {
                "content-type":"application/json",
                "Authorization": localStorage.getItem("token")
            }
        })
        const data = await request.json()
        if(data.status=="success"){
            setDatosReportados(data.rows)
            setIsThereData(true)
        }
    }
    useEffect(()=>{
        ajusteCaja()
    },[])
  return (
    <>
        <NavRecepcionista/>
        <main>
            <section>
                <TableReporteDomicilios data={datosReportados}/> 
            </section>
        </main>
    </>
  )
}

export default ReporteDomicilios