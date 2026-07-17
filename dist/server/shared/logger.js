import pino from "pino";
import { config } from "../config.js";
const isProduction = config.nodeEnv === "production";
const options = {
    level: isProduction ? "info" : "debug",
    base: {
        env: config.nodeEnv
    }
};
if (!isProduction) {
    options.transport = {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname,env"
        }
    };
}
export const logger = pino(options);
