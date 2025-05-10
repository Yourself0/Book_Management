import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Optional: only import these when running on Replit in dev
const enableReplitPlugins = async () => {
  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    const { default: runtimeErrorOverlay } = await import("@replit/vite-plugin-runtime-error-modal");
    const { cartographer } = await import("@replit/vite-plugin-cartographer");
    return [runtimeErrorOverlay(), cartographer()];
  }
  return [];
};

export default defineConfig(async ({ mode }) => {
  const isProduction = mode === "production";

  const replPlugins = await enableReplitPlugins();

  return {
    plugins: [react(), ...replPlugins],
    base: process.env.VITE_BASE_URL || "/Book_Management",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "client", "src"),
        "@shared": path.resolve(__dirname, "shared"),
        "@assets": path.resolve(__dirname, "attached_assets"),
      },
    },
    root: path.resolve(__dirname, "client"),
    build: {
      outDir: path.resolve(__dirname, "dist/public"), // for Vercel clarity
      emptyOutDir: true,
    },
  };
});






// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
// // import path from "path";
// // import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";


// export default defineConfig({
//   plugins: [react()],
//   base: process.env.VITE_BASE_URL || "/Book_Management",

// });



// export default defineConfig(async ({ mode }) => {
//   const isProduction = mode === "production";

//   const plugins = [react()];

//   if (!isProduction && process.env.REPL_ID !== undefined) {
//     const { cartographer } = await import("@replit/vite-plugin-cartographer");
//     plugins.push(runtimeErrorOverlay(), cartographer());
//   }

//   return {
//     plugins,
//     resolve: {
//       alias: {
//         "@": path.resolve(__dirname, "client", "src"),
//         "@shared": path.resolve(__dirname, "shared"),
//         "@assets": path.resolve(__dirname, "attached_assets"),
//       },
//     },
//     root: path.resolve(__dirname, "client"),
//     build: {
//       outDir: path.resolve(__dirname, "dist"),
//       emptyOutDir: true,
//     },
//   };
// });
