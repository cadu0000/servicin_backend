import { FastifyReply, FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyReply {
    setTokenCookie(token: string): FastifyReply;
  }
}

const cookieSetterPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorateReply('setTokenCookie', function (this: FastifyReply, token: string) {
    return this.header(
      'Set-Cookie',
      `token=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );
  });
};

export default fp(cookieSetterPlugin);