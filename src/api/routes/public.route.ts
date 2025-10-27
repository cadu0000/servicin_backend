import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { publicController } from '../controllers/service.controller'; 

export const publicRoutes = (
    fastify: FastifyInstance, 
    options: FastifyPluginOptions, 
    done: () => void
) => {
    fastify.get('/search', publicController.searchServicesHandler);
    done();
};