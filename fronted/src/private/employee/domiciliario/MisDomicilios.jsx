import React, { useEffect, useState } from 'react'
import { Global } from '../../../helpers/Helpers'
import io from 'socket.io-client'
import NavDomiciliarios from './NavDomiciliarios'

const MisDomicilios = () => {
    const [misDomiciliosEnCurso,setMisDomiciliosEnCurso]= useState([])
    const [isThereOrders, setIsThereOrders] = useState(false)
    const socket = io("/")
    let user = JSON.parse(localStorage.getItem("domiciliario"))
    async function finalizarPedidoDomicilio(id){
      const request = await fetch(Global.url + 'empleado/domicilios/finalizar' ,{
        method: "POST",
        headers: {
            "content-type":"application/json",
            "Authorization":localStorage.getItem("token")
        },
        body: JSON.stringify({idPedido: id, idUsuario: user.id})
      })
      const data = await request.json()
      if(data.status=="success"){
        location.reload()
      }
    }
    async function liberarOrden(id){
      const request = await fetch(Global.url + 'empleado/domicilios/liberar' ,{
        method: "POST",
        headers: {
            "content-type":"application/json",
            "Authorization":localStorage.getItem("token")
        },
        body: JSON.stringify({idPedido: id, idUsuario: user.id})
      })
      const data = await request.json()
      if(data.status=="success"){
        location.reload()
      }
    }
    async function misPedidosdomicilios (){
      const request = await fetch(Global.url + 'empleado/domicilios/' + user.id ,{
          method: "GET",
          headers: {
              "content-type":"application/json",
              "Authorization":localStorage.getItem("token")
          }
      })
      const data = await request.json()
      if(data.status=="success"){
          setMisDomiciliosEnCurso(data.domicilios)
          setIsThereOrders(true)
      }
    }
    useEffect(()=>{
      misPedidosdomicilios()
    },[])
    const pedidosAgrupados = {};
    if(isThereOrders){
      misDomiciliosEnCurso.forEach((pedido) => {
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
    socket.on("pedidoCanceladoDomicilio", data=>{
      toast.warning(data)
      setTimeout(()=>{
        location.reload()
      },2500)
    })
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
              <button className='button-take' onPointerDown={()=>{finalizarPedidoDomicilio(grupo.id)}} >Finalizar</button>
              <button className='button-take' onPointerDown={()=>{liberarOrden(grupo.id)}} >Liberar</button>
            </div>
          </div>
        ));
    };    

  return (
    <>
      <header className='header-domiciliario'>
          <NavDomiciliarios/>
      </header>
      <section>
        {renderPedidos()}
        {!isThereOrders ? <p>Sin pedidos</p>: ""}
      </section>
    </>
  )
}

export default MisDomicilios