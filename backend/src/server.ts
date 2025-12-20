import app from "./app";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
   console.log(`
  ============================================
  Tabibi Medical Appointment System API
  ============================================
  Status:    Running
  Port:      ${PORT}
  Environment: ${process.env.NODE_ENV}
  Time:      ${new Date().toISOString()}
  ============================================
  `);
});

// Graceful shutdown
process.on("SIGTERM", () => {
   console.log("SIGTERM signal received: shutting down gracefully...");
   server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
   });
});

process.on("SIGINT", () => {
   console.log("SIGINT signal received: shutting down gracefully...");
   server.close(() => {
      console.log("HTTP server closed.");
      process.exit(0);
   });
});

export default server;
