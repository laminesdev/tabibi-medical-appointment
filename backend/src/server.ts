import app from "./app";
import { BaseRepository } from "./repositories/base.repository";
import { Logger } from "./utils/logger.utils";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
   Logger.info(`Server started on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// Graceful shutdown
const shutdownHandler = async (signal: string) => {
   Logger.info(`${signal} signal received: shutting down gracefully...`);
   server.close(async () => {
      Logger.info("HTTP server closed.");
      await BaseRepository.disconnectAll();
      Logger.info("Database connections closed.");
      process.exit(0);
   });
};

process.on("SIGTERM", () => shutdownHandler("SIGTERM"));
process.on("SIGINT", () => shutdownHandler("SIGINT"));

export default server;
