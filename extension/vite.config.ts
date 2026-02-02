import { defineConfig } from "vite"
import { resolve } from "path"
import { copyFileSync, existsSync, mkdirSync, renameSync } from "fs"

export default defineConfig({
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                background: resolve(__dirname, "src/background/index.ts"),
                content: resolve(__dirname, "src/content/index.ts"),
                popup: resolve(__dirname, "src/popup/popup.html"),
            },
            output: {
                entryFileNames: "[name].js",
                chunkFileNames: "chunks/[name]-[hash].js",
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === "popup.css") {
                        return "popup.css"
                    }
                    if (assetInfo.name?.endsWith(".css")) {
                        return "content.css"
                    }
                    return "[name][extname]"
                },
            },
        },
        // Don't minify for easier debugging during development
        minify: false,
        sourcemap: true,
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    // Copy static files from public directory
    publicDir: "public",
    plugins: [
        {
            name: "fix-popup-html-location",
            closeBundle() {
                // Move popup.html from src/popup/ subdirectory to root of dist
                const srcPath = resolve(__dirname, "dist/src/popup/popup.html")
                const destPath = resolve(__dirname, "dist/popup.html")

                if (existsSync(srcPath)) {
                    copyFileSync(srcPath, destPath)
                    console.log("Copied popup.html to dist root")
                }
            },
        },
    ],
})
