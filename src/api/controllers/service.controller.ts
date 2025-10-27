import { FastifyReply, FastifyRequest } from 'fastify';
import { publicSearchService } from '../../container/index'; 
import { PublicSearchQueryType } from '../../schemas/service.schema';
import { InvalidInputError } from '../../core/errors/InvalidInputError';

interface SearchQuery {
    q?: string;
}

type SearchRequest = FastifyRequest<{ Querystring: PublicSearchQueryType }>;

export class PublicController {
    async searchServicesHandler(
        req: SearchRequest, 
        res: FastifyReply
    ): Promise<void> {
        const filters = req.query; 

        try {
            const results = await publicSearchService.execute(filters);
            res.status(200).send(results);

        } catch (error) {
            if (error instanceof InvalidInputError) {
                console.warn(`[API] Invalid Input: ${error.message}`);
                return res.status(400).send({ 
                    message: error.message,
                    code: 'INVALID_INPUT'
                });
            }

            console.error("[API] Internal Error during search:", error);
            return res.status(500).send({ 
                message: "Falha interna ao processar a busca.",
                code: 'INTERNAL_SERVER_ERROR'
            });
        }
    }
}

export const publicController = new PublicController();