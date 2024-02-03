import React from 'react'
import imagesGaseosa from '../../../../public/imagenes/gaseosas.jpg'
import imagesPizza from '../../../../public/imagenes/pizza.png'
import imagesHamburguesa from '../../../../public/imagenes/hamburguesa.png'
import imagesPerro from '../../../../public/imagenes/perro.jpg'
const RenderImages = ({params}) => {
  return (
    <div >
        {params.row.categoria == 'Pizzas' && <img src={imagesPizza} alt=""  className='img-avatar-producto'/>}
        {params.row.categoria == 'hamburguesas' && <img src={imagesHamburguesa} alt=""  className='img-avatar-producto'/>}
        {params.row.categoria == 'bebidas' && <img src={imagesGaseosa} alt=""  className='img-avatar-producto'/>}
        {params.row.categoria == 'pizzas' && <img src={imagesPizza} alt=""  className='img-avatar-producto'/>}
        {params.row.categoria == 'perros' && <img src={imagesPerro} alt=""  className='img-avatar-producto'/>}
    </div>
  )
}

export default RenderImages