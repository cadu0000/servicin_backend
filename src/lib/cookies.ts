import { FastifyReply, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";

declare module "fastify" {
  interface FastifyReply {
    setTokenCookie(token: string): FastifyReply;
    clearTokenCookie(): FastifyReply;
  }
}

const cookieSetterPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateReply(
    "setTokenCookie",
    function (this: FastifyReply, token: string) {
      return this.header(
        "Set-Cookie",
        `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
      );
    }
  );

  fastify.decorateReply("clearTokenCookie", function (this: FastifyReply) {
    return this.header(
      "Set-Cookie",
      "token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT"
    );
  });
};

export default fp(cookieSetterPlugin);
