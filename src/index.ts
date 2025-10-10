import fastifySwagger from "@fastify/swagger";
import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";
import scalarFastify from "@scalar/fastify-api-reference";

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

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
