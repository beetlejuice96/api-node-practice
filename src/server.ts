import express from "express";
import "reflect-metadata";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { BookResolver } from "./resolvers/book.resolver";

export const startServer = async () => {
  const apolloServer = new ApolloServer({
    schema: await buildSchema({ resolvers: [BookResolver] }),
  });
  const app = express();
  apolloServer.applyMiddleware({ app, path: "/graphql" });
  return app;
};
