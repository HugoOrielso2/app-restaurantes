import React, { useEffect, useState } from 'react'
import NavEmpleado from '../mesero/NavEmpleado'
import ProductosRecepcionista from './ProductosRecepcionista'
import { CartRecepcionista } from './CartRecepcionista'
import  io  from 'socket.io-client'
import Filters from '../mesero/Filters'
import HeaderFiltros from '../mesero/HeaderFiltros'
import { Global } from '../../../helpers/Helpers'
import NavRecepcionista from './NavRecepcionista'

const InicioRecepcionista = () => {
  const socket = io()
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
      <NavRecepcionista/>
      <main>
          <HeaderFiltros>
            <Filters onChange={setFiltersProduct}/>
          </HeaderFiltros>
          <ProductosRecepcionista productos={filteredProducts} addCart={addToCart} cart={cart} removeFromCart={removeFromCart}/>
          <CartRecepcionista cart={cart} clearCart={clearCart} addToCart={addToCart}/>
      </main>
    </>
  )
}

export default InicioRecepcionista