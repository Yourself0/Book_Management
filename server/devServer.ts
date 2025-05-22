// server/devServer.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config"; // Assuming this path is correct relative to server/devServer.ts
import { nanoid } from "nanoid";

const viteLogger = createLogger();

// Your log function (keep it if needed)
export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`<span class="math-inline">\{formattedTime\} \[</span>{source}] ${message}`);
}

// This function sets up the Vite dev server for SSR/hybrid development
export async function setupViteDevServer(app: Express, server: Server) {
  log("Setting up Vite Development Server...", "ViteDev");
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
  };

  // Create a Vite dev server instance
  const vite = await createViteServer({
    ...viteConfig, // Your main vite.config.ts
    configFile: false, // Don't look for a config file here, use the passed one
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  // Use Vite's development middleware
  app.use(vite.middlewares);

  // Fallback for all other routes to serve transformed index.html
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // Read index.html from client folder for dev mode
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "..", // From server/devServer.ts to root
        "client",
        "index.html",
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      // Transform HTML on the fly with Vite dev server
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

// This function serves static assets from a *specific* production build path in a traditional Express server
export function serveStaticProd(app: Express) {
  log("Serving static assets for production...", "StaticServe");
  // THIS PATH IS CRITICAL - it should match where Vite builds its assets
  // However, for Vercel, this is usually NOT needed in the serverless function
  const distPath = path.resolve(import.meta.dirname, "..", "dist", "public"); // Adjust relative path from server/devServer.ts to root/dist/public

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `[Prod Static Server] Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // Fallback to index.html for client-side routing
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}