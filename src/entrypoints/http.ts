import { createHttpApp } from "#bootstrap/http/create-http-app";
import { env } from "#infraestructure/config/env";

const app = createHttpApp();

app.listen(env.port, () => {
  console.log(`[http] server running on port ${env.port}`);
});
