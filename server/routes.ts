import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  // This is a frontend-only application that uses PGlite for client-side database
  // No server-side API routes needed as all data operations happen in the browser

  // Create a simple health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
  });

  const httpServer = createServer(app);

  return httpServer;
}
