import React from 'react'
import { useForm } from 'react-hook-form'
import '/public/css/Agrega.css'
import { Global } from '../../helpers/Helpers';
import { Toaster , toast } from 'sonner'

const Agregar = ({setOpen}) => {
    const {register, handleSubmit, formState:{errors}, reset} = useForm({})

    async function registrarProducto(e){
        let obj = {
            nombre: e.nombre,
            precio: e.precio,
            categoria: e.categoria,
            subcategoria: e.subcategoria
        }
        const request = await fetch(Global.url + 'propietario/productos',{
            method: "POST",
            headers: {
                "content-type":"application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(obj)
        })
        const data = await request.json()
        if(data.status=="success"){
            toast.success("Producto agregado correctamente")
            reset()
        }
        if(data.status=="error"){
            toast.error("Error al almacenar el producto")
            reset()  
        }
    }
    return (
        <div className='add'>
        <div className='modal'>
            <h2 className='title-add'>Agregar producto</h2>
            <form action="" className='form-add' onSubmit={handleSubmit(registrarProducto)}>
                <button onClick={()=>{setOpen(false)}} className='close' >X</button>
                <div className='item-add'>
                    <label htmlFor="nombre">Nombre</label>
                    <input type="text" id='nombre' {...register("nombre", {required: "El campo es obligatorio",pattern: {value: /^[a-zA-Z]+$/ , message: "Sólo se aceptan letras"}})} placeholder='Nombre producto'  className={`${errors.nombre ? "error-input":""}`}/>
                </div>
                <div className='item-add'>
                    <label htmlFor="precio">Precio</label>
                    <input type="text" id='precio' {...register("precio",{required: "El campo es obligatorio", pattern: {value: /^\d+$/, message: "Sólo se aceptan números"}})} placeholder='Precio producto'  className={`${errors.precio ? "error-input":""}`}/>
                </div>
                <div className='item-add'>
                    <label htmlFor="categoria">Categoría</label>
                    <input type="text" id='categoria' {...register("categoria", {required: "El campo es obligatorio", pattern: {value: /^[a-zA-Z]+$/ , message: "Sólo se aceptan letras"}})} placeholder='Categoría producto'  className={`${errors.categoria ? "error-input":""}`}/>
                </div>
                <div className='item-add'>
                    <label htmlFor="subcategoria">Subcategoría</label>
                    <input type="text" id='subcategoria' {...register("subcategoria", {required: "El campo es obligatorio", pattern: {value: /^[a-zA-Z]+$/ , message: "Sólo se aceptan letras"}})} placeholder='Subcategoría producto'  className={`${errors.subcategoria ? "error-input":""}`}/>
                </div>
                <button className='btn-agregar' type='submit'>Registrar</button>
            </form>
        </div>
    </div>
  )
}

export default Agregar