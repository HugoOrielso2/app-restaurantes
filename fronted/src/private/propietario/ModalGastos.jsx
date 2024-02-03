import React from 'react'
import { useForm } from 'react-hook-form'
import { Global } from '../../helpers/Helpers'

const ModalGastos = ({abrir}) => {
    const {register , handleSubmit, formState : {errors}, reset} = useForm({})
    async function nuevoGasto (e){
        const request = await fetch(Global.url + "propietario/gastos", {
            method: "POST",
            headers: {
                "content-type": "application/json",
                "Authorization": localStorage.getItem("token")
            },
            body: JSON.stringify(e)
        })
        const data = await request.json()
        if(data.status=="success"){
            location.reload()
        }
    }
  return (
    <>
        <section className='modal-gasto'>
            <div className='modal'>
                <h2 className='title-add-gasto'>Registrar gastos</h2>
                <form onSubmit={handleSubmit(nuevoGasto)} className='form-gastos'>
                    <button onPointerDown={()=>{abrir(false)}} className='close-modal'>X</button>
                    <div className='gasto-div'>
                        <label htmlFor="monto" className='label-gasto'>Precio</label>
                        <input type="text" id="monto" {...register("monto", {required: "El campo es obligatorio", pattern: {value: /^\d+$/, message: "Sólo se aceptan números"} })} className={`monto ${errors.monto ? "error-input":""}`}  placeholder='Precio'/>
                    </div>
                    <div className='gasto-div'>
                        <label htmlFor="descripcion" className='label-gasto'>Detalle del gasto</label>
                        <textarea name="descripcion" className={`textarea ${errors.descripcion ? "error-input":""}`} {...register("descripcion", {required: "El campo es obligatorio", pattern: {value: /^[a-zA-Z]+$/ , message: "Sólo se aceptan letras"} })} placeholder='Descripción'/>
                    </div>
                    <div className='container-botones-modal-gasto'>
                        <button className='btn-agregar'>Registrar</button>
                    </div>
                </form>
            </div>
        </section>
    </>
  )
}

export default ModalGastos