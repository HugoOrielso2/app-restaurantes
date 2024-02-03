import React, { useEffect, useState } from 'react'
import AsideOwner from './AsideOwner'
import '../../../public/css/owner.css'
import NavBarOwner from './NavBarOwner'
import { Control, User } from './IconsNav'
import ChartBox from './ChartBox'
import TodosLosUsuarios from './TodosLosUsuarios'
import MaxVentas from './MaxVentas'
import { Global } from '../../helpers/Helpers'
const Administracion = () => {
  const [allUsers ,setAllUsers]= useState([])
  const [allPedidos ,setAllPedidos]= useState([])
  async function todosLosPedidos(){
    const request = await fetch(Global.url + 'propietario/todosLosPedidos', {
        method: "GET",
        headers: {
          "content-type":"application/json",
          "Authorization": localStorage.getItem("token")
        }
    })
    const data = await request.json()
    if(data.status=="success"){
      setAllPedidos(data.pedidos)
    }
  }
  let data = [];
  allPedidos.forEach(element => {
    data.push(element)
  });
  async function allUsersInDb (){
    const request = await fetch(Global.url + 'propietario/usuariosDisponibles',{
      method: "GET",
      headers: {
        "content-type":"application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    if(data.status=="success"){
      setAllUsers(data.usuarios)
    }
  }
  let totalPedidos = 0
  allPedidos.forEach(element => {
    totalPedidos+= element.total_pedidos 
  });
  useEffect(()=>{
    allUsersInDb()
    todosLosPedidos()
  },[])
  return (
    <>
    <NavBarOwner/>
    <section className='wrapper'>
      <AsideOwner/>
      <main >
        <section className='estadisticas'>
          <div className='box box1'>
            <h1 className='estadistical-h1'>Usuarios</h1>
            <div className='list-users'>
              <TodosLosUsuarios allUsers={allUsers}/>
            </div>    
          </div>
          <div className='box box2' > 
            <span ><strong>Controla tu negocio con un solo toque  </strong></span>
            <Control/>
          </div>
          <div className='box box3' > <MaxVentas/> </div>
          <div className='box box4' style={{placeContent: "center", display: "grid"}}>Ten control total de lo que hacen los usuarios ✅.   </div>
          <div className='box box6'> <ChartBox allPedidos={allPedidos}/>  </div>
          <div className='box box7'> 
            <h3>Estos han sido la cantidad de pedidos en los últimos 7 días</h3>
            <span className='totalPedidoCircle'>{totalPedidos}</span>
          </div>
        </section>
      </main>
    </section>
    </>
  )
}

export default Administracion