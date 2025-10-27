import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { publicController } from '../controllers/service.controller';
import { PublicSearchQuerySchema } from '../..//schemas/service.schema';

export const publicRoutes = (
    fastify: FastifyInstance, 
    options: FastifyPluginOptions, 
    done: () => void
) => {

    fastify.get('/search', {
        schema: {
            querystring: PublicSearchQuerySchema, 
        },
    }, publicController.searchServicesHandler);

    done();
};