import React, { useEffect, useState } from 'react'
import AsideOwner from './AsideOwner'
import { useForm } from 'react-hook-form'
import { Global } from '../../helpers/Helpers'
import NavBarOwner from './NavBarOwner'
import '/public/css/propietarioEmpleado.css'
import TodosLosUsuariosSockects from './TodosLosUsuariosSockects'
import { Toaster , toast } from 'sonner'

const RegistroEmpleado = () => {
  const {register,handleSubmit,formState: {errors} , reset} = useForm({})
  const [allUsers ,setAllUsers]= useState([])
  async function allUsersInDb (){
    const request = await fetch(Global.url + 'propietario/usuariosDisponibles',{
      method: "GET",
      headers: {
        "content-type":"application/json",
        "Authorization": localStorage.getItem("token")
      }
    })
    const data = await request.json()
    if(data.status=="success"){
      setAllUsers(data.usuarios)
    }
  }
  async function registrarEmpleado(e){
    let rol = 3
    const request = await fetch(Global.url + 'propietario/crearEmpleado/' + rol,{
      method: "POST",
      headers: {
        "content-type": "application/json",
        "Authorization": localStorage.getItem("token")
      },
      body: JSON.stringify(e)
    })
    const data = await request.json()
    if(data.status=="success"){
      toast.success("Empleado almacenado correctamente")
      reset()
    }
    if(data.status == "error"){
      toast.error("No se pudo crear el usuario")
      reset()
    }
  }
  useEffect(()=>{
    allUsersInDb()
  },[])
  return (
    <>
    <NavBarOwner/>
    <section className='wrapper'>
      <AsideOwner/>
      <main className='main-propietario-empleado'>
        <section className='container-form-empleados'>
          <form className='form-registro-empleados' onSubmit={handleSubmit(registrarEmpleado)}>
            <h1>Registro empleado</h1>
              <label htmlFor="name">Nombre</label>
              <input type="text" name="" id="name" {...register("nombre", {required: "El campo es obligatorio" , pattern: {value: /^[a-zA-Z]+$/ , message: "Sólo se aceptan letras"}})} placeholder='Nombre' className={`${errors.nombre ? "error-input":""}`}/>
              <label htmlFor="email">Correo</label>
              <input type="text" name="" id="email" {...register("email", {required: "El campo es obligatorio" ,pattern: {value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$/i, message: 'Ingrese un correo electrónico válido', }})} placeholder='Correo' className={`${errors.email ? "error-input":""}`}/>
              <label htmlFor="password">Contraseña</label>
              <input type="text" name="" id="password" {...register("password", {required: "El campo es obligatorio", minLength: {value: 8, message: 'La contraseña debe tener al menos 8 caracteres'}})} placeholder='Contraseña' className={`${errors.password ? "error-input":""}`}/>
            <div>
              <label htmlFor="subRol">Rol</label>
              <select name="" id="subRol" {...register("subRol")} >
                <option value="1">Cocinero</option>
                <option value="2">Mesero</option>
                <option value="3">Recepcionista</option>
                <option value="4">Domiciliario</option>
              </select>
            </div>
            <button>Registrar</button>
          </form>
        </section>
        <section className='users-disponibles'>
          <div className='box-users'>
            <div className='list-users'>
              <TodosLosUsuariosSockects allUsers={allUsers}/>
            </div>    
          </div>
        </section>
      </main>
      <Toaster richColors/>
    </section>
  </>
  )
}

export default RegistroEmpleado