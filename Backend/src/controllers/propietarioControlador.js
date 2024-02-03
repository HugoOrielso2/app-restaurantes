import { compareSync, hash } from "bcrypt"
import { createToken } from "../services/jwt.js"
import { conection } from "../database/conecction.js"


// iniciar sesión, crear gasto, obtener gastos, crearEmpleados
// pedidos 1: mesa, 2: domicilio, 3: llevar

export async function gastos(req,res){
    try {
        let user = req.user
        if(user.rol != 2 ){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado para realizar esta acción"
            })
        }
        const [rows] = await conection.query("SELECT * FROM gastos WHERE fecha = CURDATE()")   
        const [gastosSemana] = await conection.query("SELECT gastos.fecha, gastos.monto FROM gastos WHERE fecha BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE();")
        if(rows.length==0 && gastosSemana.length==0){
            return res.status(200).json({
                status: "vacío",
                message: "No hay gastos registrados para la fecha"
            })
        }   
        return res.status(200).json({
            status: "success",
            message: "Gastos del día",
            gastos: rows,
            gastosSemana
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error"
        })
    }
}

export async function iniciarSesion(req,res){
    let params = req.body
    if(!params.email || !params.password){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }

    try {
        const [result] = await conection.query("SELECT * FROM usuario WHERE email = ?" , [params.email])
        if(result.length == 0){
            return res.status(400).json({
                status: "error",
                message: "El usuario no existe en la base de datos"
            })
        }        
        let compare = bcrypt.compareSync(params.password , result[0].password)
        if(!compare){
            return res.status(400).json({
                status: "error",
                message: "Contraseña incorrecta"
            })
        }
        const token = createToken(result[0])
        return res.status(200).json({
            status: "success",
            message: "Identificado correctamente",
            propietario: {
                id: result[0].identification,
                nombre: result[0].name,
                rol: result[0].rol
            },
            token
        })     
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })   
    }
}

export async function crearEmpleado(req,res){
    // sub rol 1: cocinero, 2: mesero, 3: recepcionista, 4: domiciliario
    const {rol} = req.params
    let user = req.user
    if(user.rol != 2){
        return res.status(401).json({
            status: "error",
            message: "No estás autorizado para realizar esta acción"
        })
    }
    let params = req.body
    if(!params.email || !params.password || !params.nombre || !params.subRol || !rol){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [result] = await conection.query("SELECT * FROM usuario WHERE email =  ?", [params.email])
        if(result.length > 0){
            return res.status(409).json({
                status: "error",
                message: "El usuario existe en la base de datos"
            })
        }
        let pwd = await hash(params.password,10)
        params.password = pwd    
        const [query] = await conection.query("INSERT INTO usuario (name,email,password,rol,sub_rol) VALUES(?,?,?,?,?)",[params.nombre,params.email,params.password,rol,params.subRol])
        if(query.insertId){
            return res.status(201).json({
                status: "success",
                message: "Empleado almacenado correctamente",
            })
        } else{
            return res.status(400).json({
                status: "error",
                message: "Ocurrió un error",
            })
        }      
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta", 
        })
    }
}

export async function registrarGasto(req,res){
    let params = req.body
    let propietario = req.user
    try {
        if(propietario.rol != 2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado para realizar esta acción"
            })
        } 
        if(!params.monto||!params.descripcion){
            return res.status(400).json({
                status: "error",
                message: "Faltan datos por enviar"
            })
        }
        params.monto = parseFloat(params.monto)
        const [gasto] = await conection.query("INSERT INTO gastos (description,monto) VALUES (?,?)", [params.descripcion,params.monto])
        if(gasto){
            return res.status(201).json({
                status: "success",
                message: "Gasto registrado correctamente",
            })
        }else{
            return res.status(400).json({
                status: "error",
                message: "Error en la consulta"
            })
        }
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
            error
        })
    }
}

export async function iniciarSesionPropietario(req,res){
    let params = req.body
    if(!params.email || !params.password){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    try {
        const [result] = await conection.query("SELECT * FROM propietario WHERE email = ?" , [params.email])
        if(result.length == 0){
            return res.status(400).json({
                status: "error",
                message: "El usuario no existe en la base de datos"
            })
        }        
        let compare = compareSync(params.password , result[0].password)
        if(!compare){
            return res.status(400).json({
                status: "error",
                message: "Contraseña incorrecta"
            })
        }
        const token = createToken(result[0])
        return res.status(200).json({
            status: "success",
            message: "Identificado correctamente",
            propietario: {
                id: result[0].identification,
                nombre: result[0].name,
                rol: result[0].rol
            },
            token
        })     
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })   
    }
}

export async function obtenerGanancias (req,res){
    try {
        let user = req.user
        if(user.rol != 2 ){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado para realizar esta acción"
            })
        }
        const [rows] = await conection.query("SELECT * FROM pedidos WHERE fecha_pedido = CURDATE()")
        const [ingresosSemana] = await conection.query("SELECT pedidos.fecha_pedido, pedidos.total FROM pedidos WHERE fecha_pedido BETWEEN DATE_SUB(CURDATE(), INTERVAL 7 DAY) AND CURDATE();")
        if(rows.length==0 && ingresosSemana.length ==0){
            return res.status(204).json({})
        }
        return res.status(200).json({
            status: "success",
            message: "Pedidos del día",
            rows,
            ingresosSemana
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error"
        }) 
    }
}
export async function productosDisponibles(req,res){
    try {
        const [rows] = await conection.query("SELECT * FROM productos")
        if(rows.length==0){
            return res.status(200).json({
                status: "success",
                message: "Sin productos",
                productos: rows
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Productos disponibles",
            productos: rows
        })

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}
export async function allUsers(req,res){
    let user = req.user
    try {
        if(user.rol != 2 ){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado para realizar esta acción"
            })
        }
        const [rows] = await conection.query("SELECT email, name, rol FROM usuario")
        if(rows.length==0){
            return res.status(200).json({
                status: "success",
                message: "Sin Usuarios",
                usuarios: rows
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Usuarios disponibles",
            usuarios: rows
        })

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}
export async function allPedidosGroups (req,res){
    let user = req.user
    try {
        if(user.rol != 2 ){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado para realizar esta acción"
            })
        }
        const [rows] = await conection.query("SELECT DATE(fecha_pedido) as fecha, COUNT(*) as total_pedidos FROM pedidos WHERE fecha_pedido >= DATE_SUB(NOW(), INTERVAL 7 DAY) GROUP BY fecha ORDER BY fecha;")
        if(rows.length==0){
            return res.status(200).json({
                status: "success",
                message: "Sin pedidos",
                pedidos: rows
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Todos los pedidos",
            pedidos: rows
        })

    } catch (error) {
        return res.status(400).json({
            status: "error",
            pedidos: "Ocurrió un error en la consulta"
        })
    }
}
export async function productosMasVendidos(req,res){
    let user = req.user
    try {
        if(user.rol != 2 ){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado para realizar esta acción"
            })
        }
        const [rows] = await conection.query("SELECT  p.nombre, COUNT(*) as total_ventas FROM detalles_pedido dp JOIN productos p ON dp.producto_id = p.producto_id GROUP BY dp.producto_id ORDER BY total_ventas DESC LIMIT 5;")
        if(rows.length==0){
            return res.status(200).json({
                status: "success",
                message: "Sin productos",
                ventas: rows
            })
        }
        return res.status(200).json({
            status: "success",
            message: "productos más vendidos",
            ventas: rows
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            pedidos: "Ocurrió un error en la consulta"
        })
    }
}
export async function inventario(req,res){
    try {
        let user = req.user
        if(user.rol!=2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado"
            })
        }
        const [rows] = await conection.query("SELECT * FROM productos")
        if(rows.length==0){
            return res.status(200).json({
                status: "vacio"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Productos en base de datos",
            rows
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta"
        })
    }
}
export async function registrarProducto(req,res){
    let body = req.body
    try {
        let user = req.user
        if(user.rol!=2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado"
            })
        }
        const [rows] = await conection.query("INSERT INTO productos (nombre,precio,categoria,subcategoria) VALUES (?,?,?,?)", [ body.nombre, body.precio, body.categoria,body.subcategoria])
        return res.status(200).json({
            status: "success",
            message: "Producto creado exitosamente",
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}
export async function singleProdcut(req,res){
    const {id}=req.params
    try {
        let user = req.user
        if(user.rol!=2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado"
            })
        }
        const [row] = await conection.query("SELECT nombre, precio, categoria, subcategoria FROM productos WHERE producto_id = ?", [id])
        if(row.length==0){
            return res.status(200).json({
                status: "vacio",
                message: "El producto no existe en la base de datos"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Producto encontrado",
            row
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}
export async function countSalesProducts(req,res){
    const {id}=req.params
    try {
        let user = req.user
        if(user.rol!=2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado"
            })
        }
        const [row] = await conection.query("SELECT  DATE(pedidos.fecha_pedido) AS dia, SUM(detalles_pedido.cantidad) AS cantidad_compras FROM productos JOIN detalles_pedido ON productos.producto_id = detalles_pedido.producto_id JOIN pedidos ON detalles_pedido.id = pedidos.id WHERE pedidos.fecha_pedido >= CURDATE() - INTERVAL 7 DAY AND productos.producto_id = ? GROUP BY DATE(pedidos.fecha_pedido) ORDER BY dia DESC, cantidad_compras DESC;" , [id])
        if(row.length==0){
            return res.status(200).json({
                status: "vacio",
                message: "Sin ventas"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Producto encontrado",
            row
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}
export async function editarProducto (req,res){
    const {id}=req.params
    let body = req.body
    try {
        let user = req.user
        if(user.rol!=2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado"
            })
        }
        const [row] = await conection.query("UPDATE productos SET nombre = ?, precio = ?, categoria = ?, subcategoria = ? WHERE producto_id = ?", [body.nombre,body.precio,body.categoria,body.subcategoria,id])
        if(row.length==0){
            return res.status(200).json({
                status: "vacio",
                message: "Sin ventas"
            })
        }
        return res.status(200).json({
            status: "success",
            message: "Producto actualizado correctamente",
            row
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}



export async function eliminarProducto(req,res){
    const {id}=req.params
    try {
        let user = req.user
        if(user.rol!=2){
            return res.status(401).json({
                status: "error",
                message: "No estás autorizado"
            })
        }
        const [row] = await conection.query("DELETE FROM productos WHERE producto_id = ?" ,[id])
        if(row.affectedRows>0){
            return res.status(200).json({
                status: "success",
                message: "Producto eliminado correctamente",
            })
        }
        return res.status(400).json({
            status: "error",
            message: "Producto no encontrado"
        })
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Ocurrió un error en la consulta",
        })
    }
}