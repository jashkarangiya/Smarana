import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: false, // Don't clear dist, as we are appending to main build
        rollupOptions: {
            input: resolve(__dirname, "src/content/index.ts"),
            output: {
                format: "iife", // IIFE format bundles dependencies inline
                entryFileNames: "content.js",
                inlineDynamicImports: true,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith(".css")) {
                        return "content.css"
                    }
                    return "[name][extname]"
                }
            },
        },
        minify: false,
        sourcemap: true,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
})
