import React from 'react'
import Nav from './Nav'
import { useForm } from 'react-hook-form'
import { Global } from '../helpers/Helpers'
import { Toaster , toast } from 'sonner'
import io from 'socket.io-client'

const Empleado = () => {
    const socket = io("/")
    const {register,handleSubmit,formState:{errors}} = useForm({})

    async function login(e){
        let loginEmployee = e
        const request = await fetch(Global.url + "empleado" ,{
            method: "POST",
            headers:{
                "content-type": "application/json"
            },
            body: JSON.stringify(loginEmployee)
        })
        const data = await request.json()
        if(data.status=="success"){
            toast.success("Inico de sesión exitoso")
            if(data.mesero){
                localStorage.setItem("mesero", JSON.stringify(data.mesero))
                socket.emit("login", (data.mesero.nombre))
                localStorage.setItem("token", data.token)
            }else if(data.domiciliario){
                localStorage.setItem("domiciliario", JSON.stringify(data.domiciliario))
                socket.emit("login", (data.domiciliario.nombre))
                localStorage.setItem("token", data.token)
            }else if(data.recepcionista){
                localStorage.setItem("recepcionista", JSON.stringify(data.recepcionista))
                socket.emit("login", (data.recepcionista.nombre))
                localStorage.setItem("token", data.token)
            }else if(data.cocinero){
                localStorage.setItem("cocinero", JSON.stringify(data.cocinero))
                socket.emit("login", (data.cocinero.nombre))
                localStorage.setItem("token", data.token)
            }
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
        <Nav/>
        <main className='main-inicio'>
            <section className='container-form'>
              <form onSubmit={handleSubmit(login)} className='formulario-login'>
                  <h1 style={{textTransform: "uppercase"}}>Iniciar sesión</h1>
                  <div className='container-campos'>
                    <label htmlFor="usuario"><strong>Email</strong> </label>
                    <input type="text" id='usuario' {...register("email", {required: "El campo es obligatorio", pattern: {
                        value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i,
                        message: 'Ingrese un correo electrónico válido',
                    }})} className={`input-form ${errors.email ? "error-input" : ""}`}/>
                  </div>
                  <div className='container-campos'>
                    <label htmlFor="password"> <strong>Contraseña</strong> </label>
                    <input type="password" id='password' {...register("password", {required: "El campo es obligatorio",minLength: {value: 8, message: 'La contraseña debe tener al menos 8 caracteres'}})} className={`input-form ${errors.password ? "error-input":""}`}/>
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

export default Empleado