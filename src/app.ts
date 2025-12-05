import fastify, { FastifyInstance } from "fastify";
import fastifySwagger from "@fastify/swagger";
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import scalarFastify from "@scalar/fastify-api-reference";
import fastifyCookie from "@fastify/cookie";
import { authRoutes } from "./api/routes/auth.route";
import jwtPlugin from "./lib/jwt";
import cookieSetterPlugin from "./lib/cookies";
import { serviceProviderRoutes } from "./api/routes/service-provider.route";
import { serviceRoutes } from "./api/routes/service.route";
import { categoryRoutes } from "./api/routes/category.route";
import { appointmentRoutes } from "./api/routes/appointment.route";

export async function buildApp(): Promise<FastifyInstance> {
  const server = fastify();

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Servicin API",
        description: "API documentation for Servicin application",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarFastify, {
    routePrefix: "/docs",
  });

  server.register(fastifyCookie);
  server.register(cookieSetterPlugin);
  server.register(jwtPlugin);

  server.register(authRoutes, { prefix: "/auth" });
  server.register(serviceRoutes, { prefix: "/services" });
  server.register(serviceProviderRoutes, { prefix: "/service-providers" });
  server.register(categoryRoutes, { prefix: "/categories" });
  server.register(appointmentRoutes, { prefix: "/appointments" });

  return server;
}
