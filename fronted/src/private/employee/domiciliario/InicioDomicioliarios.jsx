import React, { useEffect, useState } from 'react'
import '/public/css/domiciliarios.css'
import { Global } from '../../../helpers/Helpers'
import NavDomiciliarios from './NavDomiciliarios'
import io from 'socket.io-client'
const InicioDomicioliarios = () => {
    const socket = io("/")
    const [arrayDomicilios,setArrayDomicilio]= useState([])
    const [isThereOrders, setIsThereOrders] = useState(false)
    let user = JSON.parse(localStorage.getItem("domiciliario"))
    async function takeOrder (id){
      const request = await fetch(Global.url + 'empleado/domicilios' ,{
          method: "POST",
          headers: {
              "content-type":"application/json",
              "Authorization":localStorage.getItem("token")
          },
          body: JSON.stringify({user, idPedido: id})
      })
      const data = await request.json()
      if(data.status=="success"){
          location.reload()
      }
    }
    async function domiciliosEnCurso(){
      const request = await fetch(Global.url + 'empleado/domicilios', {
          method: "GET",
          headers: {
              "content-type":"application/json",
              "Authorization": localStorage.getItem("token")
          }
      })
      const data = await request.json()
      if(data.status=="success"){
          setArrayDomicilio(data.domicilios)
          setIsThereOrders(true)
      }
    }
    const pedidosAgrupados = {};
    if(isThereOrders){
        arrayDomicilios.forEach((pedido) => {
          const pedidoId = pedido.pedido_id;
          if (!pedidosAgrupados[pedidoId]) {
            pedidosAgrupados[pedidoId] = {
              id: pedidoId,
              direccion: pedido.direccion,
              tipo: pedido.tipo,
              total: pedido.total,
              detalles: [],
            };
          }
          pedidosAgrupados[pedidoId].detalles.push({
            tipo: pedido.tipo,
            mesa: pedido.mesa,
            pago: pedido.pago,
            estado: pedido.estado,
            direccion: pedido.direccion,
            precio_unitario: pedido.precio_unitario,
            total: pedido.total,
            producto_cantidad: pedido.producto_cantidad,
            categoria: pedido.categoria,
            subcategoria: pedido.subcategoria,
          });
        });
    }
    const renderPedidos = () => {
        return Object.values(pedidosAgrupados).map((grupo) => (
          <div key={grupo.id} className='domicilio-en-ruta'>
            <h4 className='id-pedido'>Pedido ID: {grupo.id}</h4>
            <ul className='ul-domicilios-en-curso'>
              {grupo.detalles.map((detalle, index) =>  (
                <li key={index}>
                    <div className='mini-grid'>
                        <span className='span-producto'>{detalle.producto_cantidad} </span>
                        <span className='span-price'> {detalle.total} </span>
                    </div>
                </li>
              ))}
            </ul>
            <div className='total-delivery'>
            </div>
            <div className='delivery-details'>
                    <div className='text-detail'>
                        <p className='delivery-detail'>Domicilio: {grupo.direccion}</p>
                    </div>
                    <button className='button-take' onPointerDown={()=>{takeOrder(grupo.id)}} >Tomar</button>
            </div>
          </div>
        ));
    };
    socket.on("pedidoCanceladoDomicilio", data=>{
      toast.warning(data)
      setTimeout(()=>{
        location.reload()
      },2500)
    })
    useEffect(()=>{
        domiciliosEnCurso()
    },[])
  return (
    <>  
      <header className='header-domiciliario'>
          <NavDomiciliarios/>
      </header>
      <main style={{overflow: 'hidden'}}>
          <section className='grilla-domicilios'>
              {renderPedidos()}
          </section>
      </main>
    </>
  )
}

export default InicioDomicioliarios