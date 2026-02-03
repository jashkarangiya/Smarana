import { defineConfig } from "vite"
import { resolve } from "path"
import { existsSync, readFileSync, writeFileSync } from "fs"

export default defineConfig({
    // Use relative paths for Chrome extension compatibility
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: true,
        rollupOptions: {
            input: {
                background: resolve(__dirname, "src/background/index.ts"),
                popup: resolve(__dirname, "src/popup/popup.html"),
            },
            output: {
                // Use ES modules for background (service worker supports it)
                format: "es",
                entryFileNames: "[name].js",
                // Don't create chunks - inline everything
                manualChunks: () => undefined,
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
                // and fix the relative paths
                const srcPath = resolve(__dirname, "dist/src/popup/popup.html")
                const destPath = resolve(__dirname, "dist/popup.html")

                if (existsSync(srcPath)) {
                    let html = readFileSync(srcPath, "utf-8")
                    // Fix paths from ../../ to ./
                    html = html.replace(/src="\.\.\/\.\.\//g, 'src="./')
                    html = html.replace(/href="\.\.\/\.\.\//g, 'href="./')
                    writeFileSync(destPath, html)
                    console.log("Copied popup.html to dist root with fixed paths")
                }
            },
        },
    ],
})
