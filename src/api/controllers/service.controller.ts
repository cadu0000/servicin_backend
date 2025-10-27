import { FastifyReply, FastifyRequest } from 'fastify';
import { publicSearchService } from '../../container/index'; 

interface SearchQuery {
    q?: string;
}

export class PublicController {
    async searchServicesHandler(
        req: FastifyRequest<{ Querystring: SearchQuery }>, 
        res: FastifyReply
    ): Promise<void> {
        const searchTerm = req.query.q; 

        try {
            const results = await publicSearchService.execute(searchTerm);

            res.status(200).send(results);

        } catch (error) {
            console.error("Erro na busca pública:", error);
            
            res.status(500).send({ 
                message: "Falha interna ao processar a busca." 
            });
        }
    }
}

export const publicController = new PublicController();