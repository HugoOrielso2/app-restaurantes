import React from 'react'
import imagesGaseosa from '../../../public/imagenes/gaseosas.jpg'
import imagesPizza from '../../../public/imagenes/pizza.png'
import imagesHamburguesa from '../../../public/imagenes/hamburguesa.png'
import imagesPerro from '../../../public/imagenes/perro.jpg'
const ImagenesEdit = ({categoria}) => {
  return (
    <div >
        {categoria == 'Pizzas' && <img src={imagesPizza} alt=""  className='img-edit-producto'/>}
        {categoria == 'hamburguesas' && <img src={imagesHamburguesa} alt=""  className='img-edit-producto'/>}
        {categoria == 'bebidas' && <img src={imagesGaseosa} alt=""  className='img-edit-producto'/>}
        {categoria == 'pizzas' && <img src={imagesPizza} alt=""  className='img-edit-producto'/>}
        {categoria == 'perros' && <img src={imagesPerro} alt=""  className='img-edit-producto'/>}
    </div>
  )
}

export default ImagenesEdit