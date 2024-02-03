import React, { useEffect, useState } from 'react'
import '../../../../public/css/mesero.css'
import { Link } from 'react-router-dom'
import { Global } from '../../../helpers/Helpers'
import NavEmpleado from './NavEmpleado'
import io from 'socket.io-client'
import { Toaster, toast } from 'sonner'

const InicioMesero = () => {
  const [mesas,setMesas] = useState([])
  const socket = io("/")
  async function obtenerMesas(){
    const request = await fetch(Global.url + 'empleado/obtenerMesas', {
      method: "GET",
      headers: {
        "content-type":"application/json",
      }
    })
    const data = await request.json()
    if(data.status=="success"){
      setMesas(data.rows)
    }
  }
  socket.on("pedidoCanceladoMesa", data=>{
    toast.warning(data)  
    setTimeout(()=>{
      location.reload()
    },2500) 
  })
  useEffect(()=>{
    obtenerMesas()
  },[])
  
  return (
    <>
      <header className='header-mesero'>
        <NavEmpleado/>
      </header>

      <main className='main-mesas'>
        <h2>Mesas Venecia</h2>
        <section className='mesas'>
          <ul className='list-mesas'>
            {mesas?.map((mesa,i)=>{
              if(mesa.ocupada == 1){
                return(
                  <li key={mesa.mesa} className="container-mesa">
                    <Link to={`/mesa/${mesa.mesa}`}  className={`mesa `}>{mesa.mesa}</Link>
                  </li>
                )
              }else{
                return(
                  <li key={mesa.mesa} className="container-mesa">
                    <Link to={`/actualizar/${mesa.mesa}`}  className={`mesa ocupada`}>{mesa.mesa}</Link>
                  </li>
                )
              }
            })}
          </ul>
        </section>
      </main>
      <Toaster/>
    </>
  )
}

export default InicioMesero