import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
    base: "./",
    build: {
        outDir: "dist",
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, "src/content/index.ts"),
            name: "SmaranaContent",
            fileName: () => "content.js",
            formats: ["iife"],
        },
        rollupOptions: {
            output: {
                format: "iife",
                entryFileNames: "content.js",
                inlineDynamicImports: true, // Forces everything into one file
                extend: true,
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith(".css")) {
                        return "content.css"
                    }
                    return "[name][extname]"
                }
            },
        },
        minify: true,
        sourcemap: false,
        commonjsOptions: {
            include: [/node_modules/],
        },
    },
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
})
