import jwt from 'jwt-simple'
import moment from 'moment'
import { secret } from '../services/jwt.js'

export const auth = (req,res,next)=>{
    if(!req.headers.authorization){
        return res.status(403).json({
            status: "error",
            message: "La petición no tiene la cabecera de autenticación"
        })
    }

    let token = req.headers.authorization.replace(/['"]+/g,"")

    try {
        let payload = jwt.decode(token,secret)
        if(payload.exp<= moment().unix()){
            return res.status(401).json({
                status: "error",
                message: "Token expirado"
            })
        }
        req.user = payload        
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "Token inválido"
        })
    }
    next()
}