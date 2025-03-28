import fastify from "fastify";
import dotenv from "dotenv";
import { registerRoutes } from "./routes/auth.routes";
import { initDatabase } from "./database/database";

const app = fastify({
    logger: {
        enabled: true,
        level: "debug"
    },
    disableRequestLogging: true
});
dotenv.config();

const listeners: string[] = ["SIGINT", "SIGTERM"];
listeners.forEach((signal): void => {
    process.on(signal, async () => {
        await app.close();
        process.exit(0);
    });
});

//TODO: FIXING ENV UNDEFINED
async function start(): Promise<void> {
    try {
        const launched = await initDatabase(app);
        if (!launched) {
            app.log.error("Database failed to initialize");
            process.exit(1);
        }
        await app.listen({
            port: Number(process.env.PORT),
            host: "0.0.0.0"
        });
    } catch (error) {
        app.log.error(error);
        process.exit(1);
    }
}

registerRoutes(app).then(() => {
    start().then(() => {
        app.get("/healthcheck", (_req, response) => {
            response.send({ message: "Success" });
        });
    });
});
