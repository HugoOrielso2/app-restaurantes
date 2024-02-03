import React, { useState } from 'react'
import Nav from './Nav'
import {useForm} from 'react-hook-form'
import'../../public/css/inicio.css'
import { Global } from '../helpers/Helpers'
import { Toaster, toast } from 'sonner'
const Inicio = () => {
  const {register ,handleSubmit , formState: {errors}} = useForm({})
  const [idUser , setIdUser] = useState("")
  async function login(e){
    let obj = {
      email: e.email,
      password: e.password
    }
    const request = await fetch(Global.url + "propietario",{
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(obj)
    })
    const data = await request.json()
    if(data.status=="success"){
      toast.success("Inicio de sesión exitoso")
      localStorage.setItem("propietario", JSON.stringify(data.propietario))
      localStorage.setItem("token", data.token)
      setTimeout(()=>{
        location.reload()
      },2000)
    }
    if(data.status=="error"){
      toast.error("No se pudo iniciar sesión")
    }
  }

  return (
    <>
      <Nav />
      <main className='main-inicio'>
      <section className='container-form'>
        <form onSubmit={handleSubmit(login)} className='formulario-login'>
            <h1 style={{textTransform: "uppercase"}}>Iniciar sesión</h1>
            <div className='container-campos'>
              <label htmlFor="usuario"><strong>Usuario</strong> </label>
              <input type="text" id='usuario' {...register("email",{required: "Este campo es obligatorio", pattern: {
              value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i,
              message: 'Ingrese un correo electrónico válido',
              }})} className={`input-form ${errors.email ? "error-input" : ""}`}/>
            </div>
            <div className='container-campos'>
              <label htmlFor="password"> <strong>Contraseña</strong> </label>
              <input type="password" id='password' {...register("password", {required: "Este campo es obligatorio"})} className={`input-form ${errors.password ? "error-input":""}`}/>
            </div>
            <button type='submit'>Enviar</button>
        </form>
        <div>
          <p>¿Aún no tienes una cuenta?, comunícate con el propietario</p>
        </div>
      </section>
      </main>
      <Toaster richColors/>
    </>
  )
}

export default Inicio