import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { setupBookRoutes } from "./book-routes";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);
  
  // Set up book-related routes
  setupBookRoutes(app);

  const httpServer = createServer(app);

  return httpServer;
}
