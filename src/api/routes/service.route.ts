import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { publicController } from '../controllers/service.controller';
import { PublicSearchQuerySchema} from '../../schemas/service.schema';

export const publicRoutes = (
    fastify: FastifyInstance, 
    options: FastifyPluginOptions, 
    done: () => void
) => {

    fastify.get('/search', {
        schema: {
            summary: "Search for services",
            description: "Endpoint to search for services",
            tags: ["Search and Catalog"],
            querystring: PublicSearchQuerySchema, 
        },
    }, publicController.searchServicesHandler);

    done();
};