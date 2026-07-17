import { config } from "./config.js";
import { app } from "./server.js";
import { logger } from "./shared/logger.js";

app.listen(config.port, () => {
  logger.info(`UPRISE API listening on http://localhost:${config.port}`);
});
