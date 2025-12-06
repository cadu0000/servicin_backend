import "@fastify/jwt";
import "fastify";
import "@fastify/cookie";

export interface UserPayload {
  sub: string;
  email: string;
}

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
    user: UserPayload;
  }

  interface FastifyInstance {
    authenticate: (
      req: FastifyRequest,
      reply: import("fastify").FastifyReply
    ) => Promise<void>;
  }
}
