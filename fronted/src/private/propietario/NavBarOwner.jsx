import React from 'react'
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import {  deepPurple } from '@mui/material/colors';
const NavBarOwner = () => {
    function cerrarSesion (){
        localStorage.clear()
        setTimeout(()=>{
            location.reload()
        },1000)
      }
  return (
    <div className='nav-bar-owner'>
        <div className='container-logo-nav'>
            <div className='container-img'>

            </div>
            <div>
                <h4 className='p-principal-nav' style={{width:"200px"}}>Pizzería venecia</h4>
            </div>
        </div>
        <div>
            <div className='name-box'>
                <div className='container-name'>
                    <p>Danny</p>
                </div>
                <div className='container-name'>
                    <Stack direction="row" spacing={2}>
                        <Avatar sx={{ bgcolor: deepPurple[500] }}>D</Avatar>
                    </Stack>
                </div>
            </div>
        </div>
        <button className='buton-cerrar-sesion' style={{marginRight: "1em"}} onPointerDown={cerrarSesion}>Cerrar sesión</button>
    </div>
  )
}

export default NavBarOwner