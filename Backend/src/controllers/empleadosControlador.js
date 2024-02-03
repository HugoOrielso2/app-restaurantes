import { compareSync } from 'bcrypt'
import { createToken } from "../services/jwt.js"
import { conection } from "../database/conecction.js"

export async function crearPedido(req,res){
    let object = req.body
    const {observaciones}= req.body
    let numMesa = object.numeroDeMesa.numeroDeMesa  
    const {mesero}=req.body
    let productos = req.body.productos
    if(!observaciones||!numMesa||!productos){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [[{ocupada}]] = await conection.query("SELECT ocupada FROM mesas WHERE mesa = ?", [numMesa])
        if(ocupada != 1){
            return res.status(400).json({
                status: "error",
                message: "No se pudo crear el pedido"
            })
        }
        const tipe = "mesa"
        const state = "en preparacion"
        const [query] = await conection.query("INSERT INTO pedidos (tipo, mesa, estado, pago, total, observaciones,usuario_encargado) VALUES (?,?,?,?,?,?,?)",[tipe,numMesa,state,object.metodoDePago,object.totalPrice, observaciones,mesero])
        let inserId = query.insertId
        productos.forEach( async producto => {
            let total = (producto.precio * producto.quantity)
            const query = await conection.query("INSERT INTO detalles_pedido (id,producto_id,cantidad,precio_unitario,total) VALUES(?,?,?,?,?)" , [inserId,producto.producto_id,producto.quantity,producto.precio,total])
        });
        const [consulta] = await conection.query("UPDATE mesas SET ocupada = ? WHERE mesa = ?" , [2 , numMesa])
        return res.status(200).json({
            status: "success",
            message: "Pedido creado con éxito"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}

export async function crearPedidoRecepcion(req,res){
    let object = req.body
    let productos = req.body.productos
    const {observaciones} = req.body
    const {vueltos}=req.body
    try {
        const tipe = "domicilio"
        const state = "en preparacion"
        const domiciliario = "disponible"
        const [query] = await conection.query("INSERT INTO pedidos (tipo, direccion, estado, pago, total, usuario_encargado, observaciones, vueltos) VALUES (?,?,?,?,?,?,?,?)",[tipe,object.direccion,state,object.metodoDePago,object.totalPrice,domiciliario,observaciones,vueltos])
        let inserId = query.insertId
        productos.forEach( async producto => {
            let total = (producto.precio * producto.quantity)
            const query = await conection.query("INSERT INTO detalles_pedido (id,producto_id,cantidad,precio_unitario,total) VALUES(?,?,?,?,?)" , [inserId,producto.producto_id,producto.quantity,producto.precio,total])
        });
        return res.status(200).json({
            status: "success",
            message: "Domicilio creado con éxito"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}

export async function obtenerProductos(req,res){
    try {
        const [query] = await conection.query("SELECT * FROM productos")
        if(query.length ==0){
            return res.status(204)
        }
        return res.status(200).json({
            status: "success",
            message: "Productos en base de datos",
            query
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un erro"
        })
    }
}

export async function inicioSesionEmpleados(req,res){
    let params = req.body
    if(!params.email|| !params.password){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [query] = await conection.query("SELECT * FROM usuario WHERE email = ?", [params.email])
        if(query.length==0){
            return res.status(400).json({
                status: "error",
                message: "El usuario no existe en la base de datos"
            })
        }
        let compare = compareSync(params.password , query[0].password)
        if(!compare){
            return res.status(400).json({
                status: "error",
                message: "Contraseña incorrecta"
            })
        }
        const token = createToken(query[0])
        if(query[0].sub_rol == 1 ){
            return res.status(200).json({
                status: "success",
                message: "Identificado correctamente",
                cocinero: {
                    id: query[0].identification,
                    nombre: query[0].name,
                    rol: query[0].rol,
                    subRol: query[0].sub_rol
                },
                token
            })   
        }else if(query[0].sub_rol == 2){
            return res.status(200).json({
                status: "success",
                message: "Identificado correctamente",
                mesero: {
                    id: query[0].identification,
                    nombre: query[0].name,
                    rol: query[0].rol,
                    subRol: query[0].sub_rol
                },
                token
            })             
        }else if(query[0].sub_rol == 3){
            return res.status(200).json({
                status: "success",
                message: "Identificado correctamente",
                recepcionista: {
                    id: query[0].identification,
                    nombre: query[0].name,
                    rol: query[0].rol,
                    subRol: query[0].sub_rol
                },
                token
            }) 
        }else if(query[0].sub_rol ==4){
            return res.status(200).json({
                status: "success",
                message: "Identificado correctamente",
                domiciliario: {
                    id: query[0].identification,
                    nombre: query[0].name,
                    rol: query[0].rol,
                    subRol: query[0].sub_rol
                },
                token
            }) 
        }   
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })   
    }
}

export async function obtenerPedidosEnCurso(req,res){
    try {
        let {estado} = req.params
        const [rows] = await conection.query("SELECT * FROM pedidos INNER JOIN detalles_pedido ON pedidos.id = detalles_pedido.id WHERE estado = ? ", [estado])    
        if(rows.length==0){
            return res.status(204).json({})
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos en curso",
            rows
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function obtenerPedido(req,res){
    const {mesa}=req.params

    try {
        let estado = "en preparacion"
        let estadoDos = "en mesa"
        const [[result]] = await conection.query("SELECT id, pago FROM pedidos WHERE mesa = ? && (estado = ? || estado = ?);", [mesa,estado,estadoDos])
        const [rows] = await conection.query("SELECT detalles_pedido.id,detalles_pedido.cantidad, detalles_pedido.precio_unitario, productos.nombre, productos.categoria, productos.subcategoria FROM detalles_pedido INNER JOIN productos ON detalles_pedido.producto_id = productos.producto_id WHERE detalles_pedido.id = ?;", [result.id])    
        if(rows.length==0){
            return res.status(204).json({})
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos en curso",
            detalles_pedido: rows,
            metodoDePago: result.pago
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}

export async function obtenerMesas(req,res){
    try {    
        const [rows] = await conection.query("SELECT * FROM mesas")
        if(rows.length==0){
            return res.status(204).json({})
        }
        return res.status(200).json({
            status: "success",
            message: "Mesas disponibles",
            rows
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error"
        })
    }
}

export async function agregarProducto(req,res){
    const object = req.body
    let productos = req.body.productos
    try {
        const [query] = await conection.query("SELECT *  FROM pedidos WHERE id = ?", [id])
        if(query.length==0){
            return res.status(400).json({
                status: "error",
                message: "El pedido no existe en la base de dato"
            })
        }  
        productos.forEach(async producto => {
            let total = (producto.precio * producto.quantity)
            const query = await conection.query("INSERT INTO detalles_pedido (id,producto_id,cantidad,precio_unitario,total) VALUES(?,?,?,?,?)" , [id,producto.producto_id,producto.quantity,producto.precio,total])
            return res.status(200).json({
                status: "success",
                message: "Producto agregado exitosamente"
            })
        }); 
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function editarPedido(req,res){
    try {
        const {observaciones} = req.body
        let estado = 'en mesa'
        let segundoEstado = 'en preparacion'
        let totalEnBd = 0
        const obj = req.body
        let mesa = obj.numeroDeMesa.mesaOcupada
        let products = obj.productos
        const [[{id}]] = await conection.query("SELECT id from pedidos WHERE (mesa = ? && (estado = ? || estado = ?))",[mesa, estado,segundoEstado])
        if(!id){
            return res.status(400).json({
                status: "error",
                message: "El pedido no existe en la base de datos"
            })        
        }
        products.forEach(async product =>{
            let total = (product.precio * product.quantity)
            totalEnBd += total
            const [query] = await conection.query("INSERT INTO detalles_pedido (id,producto_id,cantidad,precio_unitario,total) VALUES(?,?,?,?,?)" , [id,product.producto_id,product.quantity,product.precio,total])
            if(query.affectedRows > 0){
            }else{
                return res.status(400).json({
                    status: "error",
                    message: "Ocurrió un error insertando los productos"
                })
            }
        })
        const [[{total}]] = await conection.query("SELECT total FROM pedidos WHERE id = ?", [id])
        if(!total){
            return res.status(400).json({
                status: "error",
                message: "Ocurrió un error al crear el pedido"
            })
        }
        totalEnBd = (totalEnBd + parseFloat(total))
        const [priceInDB] = await conection.query("UPDATE pedidos SET total = ?, observaciones = ? WHERE id = ?", 
        [totalEnBd,observaciones,id])
        if(priceInDB.affectedRows > 0){
        }else{
            return res.status(400).json({
                status: "error",
                message: "Ocurrió un error actualizando el pedido"
            })
        }
        return res.status(200).json({
            status:"success",
            message: "Agregado con éxito"
        })        
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error",
        })
    }
}

export async function finalizarOrden(req,res){
    const {mesa} = req.params
    try {
        const user = res.user
        const [query] = await conection.query("SELECT * FROM pedidos WHERE mesa = ? " , [mesa])
        if(query.length ==0){
            return res.status(204).json({})
        }
        let estado = "finalizado"
        const [actualizacion] = await conection.query("UPDATE pedidos SET estado = ? WHERE mesa = ?", [estado,mesa])
        const [actualizarMesa] = await conection.query("UPDATE mesas SET ocupada = ? WHERE mesa = ?", [1,mesa])
        return res.status(200).json({
            status: "success",
            message: "Finalizado exitosamente"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error",
        })
    }
}

export async function pedidosEnCursoCocineros(req,res){
    try {
        let estado = "en preparacion"
        const [pedidos] = await conection.query("SELECT pedidos.observaciones, pedidos.id AS pedido_id, pedidos.tipo, pedidos.mesa, pedidos.pago, pedidos.estado, pedidos.direccion, detalles_pedido.precio_unitario, detalles_pedido.total, CONCAT(productos.nombre, ' x', detalles_pedido.cantidad) AS producto_cantidad, productos.categoria, productos.subcategoria FROM pedidos JOIN detalles_pedido ON pedidos.id = detalles_pedido.id JOIN productos ON detalles_pedido.producto_id = productos.producto_id WHERE  pedidos.estado = ?", [estado])
        if(pedidos.length  == 0){
            return res.status(200).json({
                status: "vacío",
                message: "Sin pedidos",
                pedidos: []
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos en curso",
            pedidos: pedidos,
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function pedidosEnCursoCocinerosPizzero(req,res){
    try {
        let estado = "en preparacion"
        const [pedidos] = await conection.query("SELECT pedidos.observaciones, pedidos.id AS pedido_id, pedidos.tipo, pedidos.mesa, pedidos.pago, pedidos.estado, pedidos.direccion, detalles_pedido.precio_unitario, detalles_pedido.total, CONCAT(productos.nombre, ' x', detalles_pedido.cantidad) AS producto_cantidad, productos.categoria, productos.subcategoria, detalles_pedido.precio_unitario FROM pedidos JOIN detalles_pedido ON pedidos.id = detalles_pedido.id JOIN productos ON detalles_pedido.producto_id = productos.producto_id WHERE  ( productos.categoria = 'pizzas' OR EXISTS ( SELECT 1 FROM detalles_pedido dp JOIN productos p ON dp.producto_id = p.producto_id WHERE dp.id = pedidos.id AND p.categoria = 'pizzas' ) ) AND pedidos.estado = ?;",[estado])
        if(pedidos.length  == 0){
            return res.status(200).json({
                status: "vacío",
                message: "Sin pedidos",
                pedidos: []
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos en curso",
            pedidosPizzas: pedidos,
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}


export async function allOrdersInCourse(req,res){
    try {
        let estado = "finalizado"
        const [pedidos] = await conection.query("SELECT pedidos.observaciones, pedidos.id AS pedido_id, pedidos.usuario_encargado,pedidos.tipo, pedidos.mesa, pedidos.pago, pedidos.estado, pedidos.direccion, detalles_pedido.precio_unitario, detalles_pedido.total, CONCAT(productos.nombre, ' x', detalles_pedido.cantidad) AS producto_cantidad, productos.categoria, productos.subcategoria FROM pedidos JOIN detalles_pedido ON pedidos.id = detalles_pedido.id JOIN productos ON detalles_pedido.producto_id = productos.producto_id  WHERE pedidos.estado != ?;", [estado])
        if(pedidos.length  == 0){
            return res.status(200).json({
                status: "success",
                message: "Sin pedidos",
                pedidos: []
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos en curso",
            pedidos: pedidos,
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un eror en la consulta"
        })
    }
}

export async function obtenerPedidoRecepcionista(req,res){
    const {id}=req.params
    try {
        let estado = "finalizado"
        const [rows] = await conection.query("SELECT pedidos.usuario_encargado, detalles_pedido.id,detalles_pedido.cantidad, detalles_pedido.precio_unitario, productos.nombre, productos.categoria, productos.subcategoria FROM detalles_pedido INNER JOIN productos ON detalles_pedido.producto_id = productos.producto_id INNER JOIN pedidos ON pedidos.id = detalles_pedido.id WHERE detalles_pedido.id = ? AND pedidos.estado != ?;", [id, estado]) 
        const [[infoAdicional]] = await conection.query("SELECT pedidos.usuario_encargado,pedidos.estado,pedidos.tipo, CASE WHEN pedidos.tipo = 'domicilio' THEN pedidos.direccion WHEN pedidos.tipo = 'mesa' THEN pedidos.mesa ELSE NULL END AS informacion_adicional  FROM pedidos WHERE pedidos.id = ? AND pedidos.estado != ?;", [id,estado])
        const [[{pago}]] = await conection.query("SELECT pago from pedidos WHERE id = ?", [id])
        if(rows.length==0){
            return res.status(204).json({})
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos en curso",
            detalles_pedido: rows,
            metodoDePago: pago,
            infoAdicional
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}

export async function finalizarOrdenRecepcion(req,res){
    const {id} = req.params
    try {
        const [actualizacion] = await conection.query("UPDATE pedidos SET estado = ? WHERE mesa = ?", [estado,mesa])
        const [actualizarMesa] = await conection.query("UPDATE mesas SET ocupada = ? WHERE mesa = ?", [1,mesa])
        return res.status(200).json({
            status: "success",
            message: "Finalizado exitosamente"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error",
        })
    }
}

export async function domiciliosEnCurso(req,res){
    try {
        let estado = "en ruta"
        let tipe = "domicilio"
        const domi = "disponible"
        const [pedidos] = await conection.query("SELECT pedidos.id AS pedido_id, pedidos.tipo, pedidos.pago, pedidos.total, pedidos.estado, pedidos.direccion, detalles_pedido.precio_unitario, detalles_pedido.total, CONCAT(productos.nombre, ' x', detalles_pedido.cantidad) AS producto_cantidad, productos.categoria, productos.subcategoria FROM pedidos JOIN detalles_pedido ON pedidos.id = detalles_pedido.id JOIN productos ON detalles_pedido.producto_id = productos.producto_id WHERE (pedidos.estado = ? && pedidos.tipo = ? && pedidos.usuario_encargado = ?);", [estado, tipe, domi])
        if(pedidos.length == 0){
            return res.status(200).json({
                status: "vacío",
                message: "Sin pedidos"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Domicilios en curso",
            domicilios: pedidos
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function tomarPedido (req,res){
    let id = req.body.user.id
    const {idPedido} = req.body
    if(!id || !idPedido){
        return res.status(400).json({
            status:"error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [[idBd]] = await conection.query("SELECT * FROM usuario WHERE identification = ?" , [id])
        if(!idBd){
            return res.status(400).json({
                status:"error",
                message: "El ususario no existe en la base de datos"
            })
        }   
        if(idBd.sub_rol != 4){
            return res.status(400).json({
                status:"error",
                message: "No estás autorizado"
            })
        }
        const [row] = await conection.query("UPDATE pedidos SET pedidos.usuario_encargado = ? WHERE pedidos.id = ?", [id, idPedido])
        if(!row.affectedRows){
            return res.status(400).json({
                status: "no tomado",
                message: "No se pudo tomar el pedido"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Pedido tomado con éxito"
        })
    } catch (error) {
        return res.status(400).json({
            status:"error",
            message: "Error en la consulta"
        })   
    }
}

export async function misDomicilios(req,res){
    const {id} = req.params
    if(!id){
        return res.status(400).json({
            status:"error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [[idBd]] = await conection.query("SELECT * FROM usuario WHERE identification = ?" , [id])
        if(!idBd){
            return res.status(400).json({
                status:"error",
                message: "El ususario no existe en la base de datos"
            })
        }
        if(idBd.sub_rol != 4){
            return res.status(400).json({
                status:"error",
                message: "No estás autorizado"
            })
        }
        let estado = "en ruta"
        let tipe = "domicilio"
        const [pedidos] = await conection.query("SELECT pedidos.id AS pedido_id, pedidos.tipo, pedidos.pago, pedidos.total, pedidos.estado, pedidos.direccion, detalles_pedido.precio_unitario, detalles_pedido.total, CONCAT(productos.nombre, ' x', detalles_pedido.cantidad) AS producto_cantidad, productos.categoria, productos.subcategoria FROM pedidos JOIN detalles_pedido ON pedidos.id = detalles_pedido.id JOIN productos ON detalles_pedido.producto_id = productos.producto_id WHERE pedidos.estado = ? && pedidos.tipo = ? && pedidos.usuario_encargado = ?;", [estado, tipe, id])
        if(pedidos.length == 0){
            return res.status(200).json({
                status: "vacío",
                message: "Sin pedidos"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Domicilios en curso",
            domicilios: pedidos
        })
    } catch (error) {
        return res.status(400).json({
            status:"error",
            message: "Error en la consulta"
        })   
    }
}

export async function finalizarOrdenDomicilio(req,res){
    const {idPedido, idUsuario} = req.body 
    let estado = "finalizado"
    try {
        const [actualizacion] = await conection.query("UPDATE pedidos SET pedidos.estado = ? WHERE pedidos.usuario_encargado = ? AND pedidos.id = ?", [estado, idUsuario, idPedido])
        if(!actualizacion.affectedRows){
            return res.status(400).json({
                status: "error",
                message: "Ocurrió un error al finalizar la orden"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Finalizado exitosamente"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error",
        })
    }
}

export async function liberarOrden(req,res){
    const {idPedido, idUsuario} = req.body 
    let estado = "en ruta"
    let disponible = "disponible"
    let actual = "en ruta"
    try {
        const [actualizacion] = await conection.query("UPDATE pedidos SET pedidos.usuario_encargado = ?, pedidos.estado = ? WHERE pedidos.usuario_encargado = ? AND pedidos.id = ? && pedidos.estado = ?", [disponible,estado, idUsuario, idPedido,actual])
        if(!actualizacion.affectedRows){
            return res.status(400).json({
                status: "error",
                message: "Ocurrió un error al finalizar la orden"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Liberado exitosamente"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error",
        })
    }
}

export async function entregarPedidoMesa(req,res){
    const {id} = req.params
    if (!id){
        return  res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [[{tipo}]] = await conection.query("SELECT tipo FROM pedidos WHERE pedidos.id = ?;", [id])
        if(tipo == "mesa"){
            let estado = "en mesa"
            const [actualizar] = await conection.query("UPDATE pedidos SET estado = ? WHERE pedidos.id = ?;", [estado, id])
            if(!actualizar.affectedRows){
                return res.status(400).json({
                    stauts: "error",
                    message: "Ocurrión un error al actualizar el pedido"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Entregado exitosamente"
            })
        }else if(tipo== "domicilio"){
            let estado = "en ruta"
            const [actualizar] = await conection.query("UPDATE pedidos SET estado = ? WHERE pedidos.id = ?;", [estado, id])
            if(!actualizar.affectedRows){
                return res.status(400).json({
                    stauts: "error",
                    message: "Ocurrión un error al actualizar el pedido"
                })
            }
            return res.status(200).json({
                status: "success",
                message: "Entregado exitosamente"
            })
        }
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function reporteDomicilios(req,res){
    try {
        let tipo = "domicilio"
        const [rows] = await conection.query("SELECT pedidos.direccion, pedidos.fecha_pedido, pedidos.pago,pedidos.total,pedidos.vueltos,usuario.name FROM pedidos INNER JOIN usuario ON usuario.identification = pedidos.usuario_encargado WHERE pedidos.tipo = ? && fecha_pedido = CURDATE() OR fecha_pedido = CURDATE() - INTERVAL 1 DAY;", [tipo])
        if(rows.length==0){
            return res.status(200).json({
                status: "vacío",
                message: "Sin datos"
            })
        }
        return res.status(200).json({
            status: "success",
            rows
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function reporteGeneral(req,res){
    try {
        const [rows] = await conection.query("SELECT * FROM pedidos WHERE fecha_pedido = CURDATE() OR fecha_pedido = CURDATE() - INTERVAL 1 DAY;")
        if(rows.length==0){
            return res.status(200).json({
                status: "vacío",
                message: "Sin "
            })
        }
        return res.status(200).json({
            status: "success",
            rows
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}

export async function cancelarOrden(req,res){
    const {id} = req.params
    if(!id){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [[{tipo}]]= await conection.query("SELECT tipo FROM pedidos WHERE id = ?;", [id])
        if(!tipo){
            return res.status(400).json({
                status: "error",
                message: "No se puede cancelar el pedido"
            })
        }
        if(tipo=="mesa"){
            const [[{mesa}]] = await conection.query("SELECT mesa FROM pedidos WHERE id = ?", [id])
            if(!mesa){
                return res.status(400).json({
                    status: "error",
                    message: "No se puede cancelar el pedido"
                })
            }
            const [query] = await conection.query("DELETE detalles_pedido,pedidos FROM pedidos LEFT JOIN detalles_pedido ON pedidos.id = detalles_pedido.id WHERE detalles_pedido.id = ?;", [id])
            if(query.affectedRows > 0){
                const [query] = await conection.query("UPDATE mesas SET ocupada = ? WHERE mesa = ?;",[1,mesa])
                if(query.affectedRows > 0){
                    return res.status(200).json({
                        status: "success",
                        message: "Pedido cancelado con éxito",
                        tipe: "mesa"
                    })
                }
            }
        }else if(tipo == "domicilio"){
            const [query] = await conection.query("DELETE detalles_pedido,pedidos FROM pedidos LEFT JOIN detalles_pedido ON pedidos.id = detalles_pedido.id WHERE detalles_pedido.id = ?;", [id])
            if(query.affectedRows > 0){
                return res.status(200).json({
                    status: "success",
                    message: "Pedido cancelado con éxito", 
                    tipe: "domicilio"
                })
            }
            return res.status(400).json({
                status: "error",
                message: "No se pudo cancelar el pedido"
            })
        }
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un erro al cancelar el pedido"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}