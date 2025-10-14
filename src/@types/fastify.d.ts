import "@fastify/jwt";
import "fastify";
import "@fastify/cookie";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    sign: <T extends object>(payload: T) => string;
    verify: <T extends object>(token: string) => T;
    decode: (token: string) => object | null;
  }
}

declare module "fastify" {
  interface FastifyRequest {
    jwt: import("@fastify/jwt").FastifyJWT;
    user?: { sub: string; email: string };
  }
}

