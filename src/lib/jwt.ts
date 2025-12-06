import { FastifyRequest, FastifyReply, FastifyPluginAsync } from "fastify";
import fjwt from "@fastify/jwt";
import fp from "fastify-plugin";
import { env } from "../env";

const jwtPlugin: FastifyPluginAsync = async (server) => {
  await server.register(fjwt, { secret: env.JWT_SECRET });

  server.addHook("preHandler", (req, _res, next) => {
    req.jwt = server.jwt;
    next();
  });

  server.decorate(
    "authenticate",
    async (req: FastifyRequest, reply: FastifyReply) => {
      const token = req.cookies.token;
      if (!token) {
        return reply.status(401).send({ message: "Authentication required" });
      }
      try {
        const decoded = req.jwt.verify<{ sub: string; email: string }>(token);
        req.user = decoded;
      } catch (err) {
        return reply.status(401).send({ message: "Invalid token" });
      }
    }
  );
};

export default fp(jwtPlugin);
