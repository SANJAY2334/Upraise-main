import { config } from "./config.js";
import { ensureSuperAdminConfigured } from "./prisma.js";
import { app } from "./server.js";
import { logger } from "./shared/logger.js";

ensureSuperAdminConfigured().then(() => {
  app.listen(config.port, () => {
    logger.info(`UPRISE API listening on http://localhost:${config.port}`);
  });
});
