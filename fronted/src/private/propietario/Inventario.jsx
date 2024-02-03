import React, { useEffect, useState } from 'react'
import NavBarOwner from './NavBarOwner'
import AsideOwner from './AsideOwner'
import TableInventarioDos from './tables/TableInventarioDos'
import Agregar from './Agregar'
import { Global } from '../../helpers/Helpers'
import { Toaster , toast } from 'sonner'

const Inventario = () => {
  const [open,setOpen]=useState(false)
  const [inventario, setInventario] = useState([])
  async function inventarioDb(){
    const request = await fetch(Global.url + 'propietario/productos', {
      method: "GET",
      headers: {
        "content-type":"application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    if(data.status=="success"){
      setInventario(data.rows)
    }
  }
  useEffect(()=>{
    inventarioDb()
  },[])
  return (
    <>
      <NavBarOwner/>
      <section className='wrapper'>
        <AsideOwner/>
        <section className='container-table-inventario'>
        <div className='container-add'>
          <h3>Productos</h3>
          <button onClick={()=>setOpen(true)} className='add-product'>Agregar un producto</button>
        </div>
          <TableInventarioDos inventario={inventario}/>
          {open && <Agregar setOpen={setOpen}/>}
        </section>
      </section>
      <Toaster richColors/>
    </>
  )
}

export default Inventario