import { MiddlewareFn } from "type-graphql";

import { verify } from "jsonwebtoken";
import { Response, Request } from "express";
import { environment } from "../config/environment";

export interface IContext {
  req: Request;
  res: Response;
  payload: { userId: string };
}

export const IsAuth: MiddlewareFn<IContext> = ({ context }, next) => {
  try {
    //TODO: agregar la busqueda de usuario para poder verificar que verdaderamente exista el usuario antes de devolver un token.
    const bearerToken = context.req.headers["authorization"];
    if (!bearerToken) {
      throw new Error("Unauthorized");
    }
    /**
     *  Divido por espacio ya que el encabezado de autorizacion va a llegar como "Bearer laskjflkajsfkljs"
     *  y solo quiero la segunda parte.
     */
    const jwt = bearerToken.split(" ")[1];
    /**
     * La palabra secreta es usada solo a fines de apredizaje,
     *  para realizar algo mas "serio" utilizaria keys.
     */
    const payload = verify(jwt, environment.JWT_SECRET);
    context.payload = payload as any;
  } catch (error) {
    throw new Error(error as string);
  }

  return next();
};
