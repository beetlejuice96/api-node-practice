import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./resolvers/book.resolver";
import { AuthorResolver } from "./resolvers/author.resolver";
import { AuthResolver } from "./resolvers/auth.resolver";

export const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [BookResolver, AuthorResolver, AuthResolver],
    }),
    /**
     * Es todo aquello que le vamos a pasar a nuestra app y va  a estar disponible para todos los resolvers.
     * vamos a recibir req y res, esto lo recibimos de express, por lo que entiendo esto seria una especie de middleware?
     * esto lo interceptamos para poder extraer el encabezado de autorizacion.
     */
    context: ({ req, res }) => ({ req, res }),
  });
  const app = express();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
  return app;
};
