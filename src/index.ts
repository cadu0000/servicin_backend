import { buildApp } from "./app";

async function start() {
  const server = await buildApp();

  server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`✅ Server listening at ${address}`);
  });
}

start();