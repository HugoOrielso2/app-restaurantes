import express  from "express";
import cors from 'cors'
import { Server } from "socket.io";
import {createServer} from 'node:http'
import routerOwner from "./routes/owner.routes.js";
import routerAdmin from "./routes/admin.routes.js";
import routerEmployee from "./routes/empleado.routes.js";
const app = express()

app.use(cors())
app.use(express.json({limit:"50mb"}))
app.use(express.urlencoded({ extended: true }))

const PORT = process.env.PORT ?? 4321

const server = createServer(app)
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
})
const usuariosConectados = [];
const dataUser = {}
app.use("/api/propietario", routerOwner)
app.use("/api/admin", routerAdmin)
app.use("/api/empleado", routerEmployee)


io.on("connection" , socket =>{
    socket.on("login", (data)=>{
        console.log(data);
        dataUser[data] = {nombre: data, conectado: true}
        usuariosConectados.push(dataUser)
        socket.broadcast.emit("login", usuariosConectados)
    })
    socket.on("newOrderFromMesa", (data)=>{
        socket.broadcast.emit("newOrderFromMesa", data)
    })
    socket.on("newOrderFromRecepcion" , (data)=>{
        socket.broadcast.emit("newOrderFromRecepcion", data)
    })
    socket.on("newDelivery", (data)=>{
        socket.broadcast.emit("newDelivery", data)
    })
    socket.on("pedidoCanceladoMesa", data=>{
        socket.broadcast.emit("pedidoCanceladoMesa", data)
    })
    socket.on("pedidoCanceladoDomicilio", data=>{
        socket.broadcast.emit("pedidoCanceladoDomicilio", data)
    })
    socket.on("actualizarConection", (data)=>{
        usuariosConectados[data] = {conectado: false}
        socket.broadcast.emit("actualizarConection", usuariosConectados)
    })
})

server.listen(PORT, ()=>{
    console.log(`Server on port ${PORT}`);
})