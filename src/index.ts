import fastify from "fastify";
import fastifySwagger from "@fastify/swagger";
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import scalarFastify from "@scalar/fastify-api-reference";

import { userRoutes } from "./api/routes/user.route";
import { publicRoutes } from "./api/routes/public.route";
import { jwtPlugin } from "./lib/jwt";
import cookieSetterPlugin from "./lib/cookies";

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
  configuration: {
    metaData: {
      title: "Servicin API",
      description: "API documentation for Servicin application",
    },
  },
});

server.register(cookieSetterPlugin);
server.register(jwtPlugin);

server.register(userRoutes, { prefix: "/user" });
server.register(publicRoutes, { prefix: "/public" }); 

server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`✅ Server listening at ${address}`);
});
