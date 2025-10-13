import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fjwt from "@fastify/jwt";
import { env } from "../env";

export async function jwtPlugin(server: FastifyInstance) {
  server.register(fjwt, { secret: env.JWT_SECRET });

  server.addHook("preHandler", (req, _res, next) => {
    req.jwt = server.jwt;
    next();
  })};