 import { FastifyInstance } from "fastify";
import fCookie from "@fastify/cookie";
import { env } from "../env";

export async function cookiePlugin(server: FastifyInstance) {
  server.register(fCookie, {
    secret: env.COOKIE_SECRET,
    hook: "preHandler",
  });
}