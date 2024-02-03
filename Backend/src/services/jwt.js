import jwt from 'jwt-simple'
import moment from 'moment'

export const secret = "Clave_DEL_PrOyEcTo_PiZZEria_VENEcia_1234"

export const createToken = (user)=>{
    if(user.subRol){
        const payload = {
            id: user.identification,
            name: user.name,
            email: user.email,
            rol: user.rol,
            subRol: user.subRol,
            iat: moment().unix(),
            exp: moment().add(30,"days").unix()
        }
    }
    const payload = {
        id: user.identification,
        name: user.name,
        email: user.email,
        rol: user.rol,
        iat: moment().unix(),
        exp: moment().add(30,"days").unix()
    }
    return jwt.encode(payload,secret)
}