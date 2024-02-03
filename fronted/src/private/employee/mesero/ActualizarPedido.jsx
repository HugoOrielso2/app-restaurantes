import React, { useEffect, useState } from 'react'
import { Global } from '../../../helpers/Helpers'
import { useParams } from 'react-router-dom'
import NavEmpleado from './NavEmpleado'
import HeaderFiltros from './HeaderFiltros'
import '/public/css/pedidoEnCurso.css'
import Filters from './Filters'
import ProductosActualizar from './ProductosActualizar'
import { CartActualizar } from './CartActualizar'
import io from 'socket.io-client'
import { Toaster, toast } from 'sonner'

const ActualizarPedido = () => {
  const {mesaOcupada}=useParams()
  const socket = io("/")
  const fechaActual = new Date()
  const year = fechaActual.getFullYear()
  const month = fechaActual.getMonth() + 1
  const day = fechaActual.getDate()
  const [detallesPedido, setDetallePedido]=useState([])
  const [metodoDePago,setMetodoDePago]=useState("")
  const [productos, setProductos] = useState([])
  const [cart,setCart]=useState([])
  const [filters,setFiltersProduct]=useState({
    category: "all",
    busqueda: ""
  })
  const filterProducts = (productos)=>{
    return productos.filter(producto=>{
      return (
        producto.nombre.toLowerCase().includes(filters.busqueda) &&
        (
          filters.category == "all" || filters.category == producto.categoria
        )
      )
    })
  }
  socket.on("pedidoCanceladoMesa", data=>{
    toast.warning(data)
    setTimeout(()=>{
      location.href("/inicioMesero")
      location.reload()
    },2000)
  })
  const filteredProducts = filterProducts(productos)
  const addToCart = producto=>{
    const productInCartIndex = cart.findIndex(item=>item.producto_id==producto.producto_id)    
    if(productInCartIndex >=0){
      const newCart= structuredClone(cart)
      newCart[productInCartIndex].quantity += 1
      return setCart(newCart)
    }

    setCart(prevState=>([
      ...prevState,
      {
        ...producto,
        quantity: 1
      }
    ]))
  }

  
  const removeFromCart = producto =>{
    setCart(prevState=>prevState.filter(item=>item.producto_id != producto.producto_id))
  }
  const clearCart = ()=>{
    setCart([])
  }
  let total = 0
  async function obtenerPedidoEnCurso(){
    const request = await fetch(Global.url + "empleado/obtenerPedido/" + mesaOcupada,{
      method: "GET",
      headers: {
        "content-type":"application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    console.log(data);
    if(data.status=="success"){
      setDetallePedido(data.detalles_pedido)
      setMetodoDePago(data.metodoDePago)
    }
  }
  
  async function getProducts(){
    const request = await fetch(Global.url + 'empleado',{
      method: "GET",
      headers: {
        "content-type": "application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    if(data.status== "success"){
      setProductos(data.query)
    }
  }
  async function finalizarOden(){
    const request = await fetch(Global.url + 'empleado/finalizar/' + mesaOcupada,{
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    if(data.status=="success"){
      setTimeout(()=>{
        location.href = "/inicioMesero"
      },1000)
    }
  }
  useEffect(()=>{
    obtenerPedidoEnCurso()
    getProducts()
  },[])
  return (
    <>
      <NavEmpleado/>
      <main>
        <section>
          <div className='pedido-mesa-en-curso'>
            <header className='header-en-curso'>
              <div>Venecia</div>
              <div className='date-en-curso'> <span>{`${year}/${month}/${day}`}</span>  mesa {mesaOcupada}</div>
            </header>
            <main>
              <div className='title-detalle'>Detalles</div>
              {detallesPedido.map((detalle,i)=>{
                let totalPrice = parseInt(detalle.cantidad * detalle.precio_unitario)
                total = total + parseInt(detalle.cantidad * detalle.precio_unitario)
                return(
                  <div className='name-cantidad' key={i}>
                    <div className='name-start'>
                      {detalle.nombre}
                    </div>
                    <div className='cantidades'>
                       x{detalle.cantidad}
                    </div>
                    <div className='total-detalle'>
                      $ {totalPrice}
                    </div>
                  </div>
                )
              })}
            </main>
            <footer className='footer-en-curso'>
                <div className='total-orden'>
                  Total: ${total}
                </div>
                <div>
                  Método de pago: {metodoDePago}
                </div>
            </footer>
            <div className='div-botones-acciones'>
              <button className='finalizar-orden' onPointerDown={finalizarOden}>Finalizar orden</button>
            </div>
          </div>
        </section>
        <HeaderFiltros>
          <Filters onChange={setFiltersProduct}/>
        </HeaderFiltros>
        <section >
          <ProductosActualizar productos={filteredProducts} addCart={addToCart} cart={cart} removeFromCart={removeFromCart}/>
          <CartActualizar cart={cart} clearCart={clearCart} addToCart={addToCart}/>
        </section>
      </main>
      <Toaster/>
    </>
  )
}

export default ActualizarPedido