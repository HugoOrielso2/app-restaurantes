import React, { useEffect, useId, useState } from 'react'
import { Global } from '../../../helpers/Helpers'
import NavEmpleado from './NavEmpleado'
import '/public/css/crearPedido.css'
import Productos from './Productos'
import HeaderFiltros from './HeaderFiltros'
import Filters from './Filters.jsx'
import {Cart} from './Cart.jsx'
import { Toaster } from 'sonner'
const CrearPedido = () => {
  const [productos, setProductos] = useState([])
  const [filters,setFiltersProduct]=useState({
    category: "all",
    busqueda: ""
  })
  const [cart,setCart]=useState([])
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
  useEffect(()=>{
    getProducts()
  },[])
  return (
    <>
      <NavEmpleado/>
      <main className='main-tienda'>
        <HeaderFiltros>
          <Filters onChange={setFiltersProduct}/>
        </HeaderFiltros>
        <section >
          <Productos productos={filteredProducts} addCart={addToCart} cart={cart} removeFromCart={removeFromCart}/>
          <Cart cart={cart} clearCart={clearCart} addToCart={addToCart}/>
        </section>
      </main>
      <Toaster/>

    </>
  )
}

export default CrearPedido