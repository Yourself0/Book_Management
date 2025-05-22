// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes"; // Your API route registration
import { log } from "./vite"; // Assuming log is useful in both dev/prod

// Conditionally import dev-only server setup
let setupVite: any;
let serveStatic: any;

if (process.env.NODE_ENV === "development") {
  // Only import these if in development to avoid bundling unnecessary code for production
  ({ setupVite, serveStatic } = await import("./vite")); // Dynamically import dev-specific functions
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Your logging middleware (keep this, it's useful for API logging)
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) { // Only log API requests
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });
  next();
});

(async () => {
  // Register your API routes (this should happen in both dev and prod)
  const server = await registerRoutes(app); // Assumes registerRoutes sets up API endpoints

  // Error handling middleware (keep this)
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    // In a serverless function, throwing an error after sending a response might not be ideal.
    // Consider just logging and ending the response.
    // console.error(err); // Log the actual error for debugging
    // throw err; // Only if you want Vercel to catch it as an unhandled error
  });

  // =====================================================================
  // CRITICAL CHANGE: ONLY SETUP VITE DEV SERVER LOCALLY
  // In production (Vercel), your Node.js function DOES NOT serve static files.
  // =====================================================================
  if (process.env.NODE_ENV === "development") {
    log("Running in DEVELOPMENT mode. Setting up Vite Dev Server...", "ServerInit");
    await setupVite(app, server); // This sets up Vite's dev server middleware
  } else {
    // In production on Vercel, your Node.js function is *only* for API routes.
    // Vercel itself serves the static frontend from /dist/public.
    // DO NOT call serveStatic(app) here.
    log("Running in PRODUCTION mode. API server ready.", "ServerInit");
  }

  // =====================================================================
  // CRITICAL CHANGE: DO NOT LISTEN ON A PORT IN PRODUCTION
  // Vercel handles listening for serverless functions internally.
  // =====================================================================
  if (process.env.NODE_ENV === "development") {
    const port = 5000;
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  } else {
    // In production, Vercel's serverless environment handles the listening.
    // The 'app' object itself is exported as the handler.
    // No explicit server.listen() call is needed or allowed here.
  }
})();

// =====================================================================
// EXPORT THE EXPRESS APP FOR VERCEL
// This is what Vercel invokes as your serverless function.
// =====================================================================
export default app;