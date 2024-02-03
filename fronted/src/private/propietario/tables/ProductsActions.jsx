import { Delete, Edit } from '@mui/icons-material'
import { Box, IconButton, Tooltip } from '@mui/material'
import React from 'react'
import { Link } from 'react-router-dom';
import { Global } from '../../../helpers/Helpers';
const ProductsActions = ({params}) => {
    async function eliminarProductoDB(){
        const request = await fetch(Global.url + 'propietario/producto/' + params.row.producto_id,{
            method: "DELETE",
            headers: {
                "content-type":"application/json",
                "Authorization": localStorage.getItem("token")
            }
        })
        const data = await request.json()
        if(data.status=="success"){
            location.reload()
        }
    }

  return (
    <Box>
        <Tooltip title={`Editar producto ${params.row.nombre}`}>
            <Link to={`/administracion/editarProducto/${params.row.producto_id}`} >
                <IconButton >
                    <Edit sx={{fill: "blue"}}/>
                </IconButton>
            </Link>
        </Tooltip>
        <Tooltip title={`Eliminar producto ${params.row.nombre}`}>
            <IconButton onPointerDown={eliminarProductoDB}>
                <Delete sx={{fill: "red"}}/>
            </IconButton>
        </Tooltip>

    </Box>
  )
}

export default ProductsActions