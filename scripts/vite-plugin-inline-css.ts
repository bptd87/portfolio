import { Plugin } from "vite";
import fs from "fs";
import path from "path";

export function inlineCssPlugin(): Plugin {
    return {
        name: "vite-plugin-inline-critical-css",
        apply: "build",
        enforce: "post",
        closeBundle: {
            order: "post",
            sequential: true,
            async handler() {
                // We need to wait a tiny bit to ensure files are written?
                // closeBundle hook should trigger after write.
                // However, typically better to use `writeBundle` or just run logic here.

                console.log("[inline-css-plugin] Starting CSS inlining...");
                const distDir = path.resolve(process.cwd(), "build"); // Match vite config outDir
                const indexHtmlPath = path.join(distDir, "index.html");

                if (!fs.existsSync(indexHtmlPath)) {
                    console.warn(
                        "[inline-css-plugin] dist/index.html not found. Skipping.",
                    );
                    return;
                }

                let html = fs.readFileSync(indexHtmlPath, "utf-8");

                // Find match
                const linkRegex =
                    /<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/;
                const match = html.match(linkRegex);

                if (!match) {
                    console.log(
                        "[inline-css-plugin] No external CSS link found.",
                    );
                    return;
                }

                const cssRelativePath = match[1];
                const cleanPath = cssRelativePath.startsWith("/")
                    ? cssRelativePath.slice(1)
                    : cssRelativePath;
                const cssAbsolutePath = path.join(distDir, cleanPath);

                if (!fs.existsSync(cssAbsolutePath)) {
                    console.warn(
                        `[inline-css-plugin] CSS file not found at ${cssAbsolutePath}`,
                    );
                    return;
                }

                const cssContent = fs.readFileSync(cssAbsolutePath, "utf-8");
                console.log(
                    `[inline-css-plugin] Inlining CSS (${
                        (cssContent.length / 1024).toFixed(2)
                    } KB)`,
                );

                const styleTag = `<style>${cssContent}</style>`;
                html = html.replace(match[0], styleTag);

                fs.writeFileSync(indexHtmlPath, html);
                console.log("[inline-css-plugin] Done.");
            },
        },
    };
}
