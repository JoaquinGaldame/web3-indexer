import { createHttpApp } from "#application/http-composition-root";
import { env } from "#infraestructure/config/env";

const app = createHttpApp();

app.listen(env.port, () => {
  console.log(`[http] server running on port ${env.port}`);
});
