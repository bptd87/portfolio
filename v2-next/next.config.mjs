import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  experimental: {
    externalDir: true,
  },
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "@": path.resolve(__dirname, "../src"),
      "vaul@1.1.2": "vaul",
      "sonner@2.0.3": "sonner",
      "sonner": path.resolve(__dirname, "./node_modules/sonner"),
      "recharts@2.15.2": "recharts",
      "react-resizable-panels@2.1.7": "react-resizable-panels",
      "react-hook-form@7.55.0": "react-hook-form",
      "react-hook-form": path.resolve(__dirname, "./node_modules/react-hook-form"),
      "@hookform/resolvers": path.resolve(
        __dirname,
        "./node_modules/@hookform/resolvers",
      ),
      "zod": path.resolve(__dirname, "./node_modules/zod"),
      "react-day-picker@8.10.1": "react-day-picker",
      "react-quill-new": path.resolve(
        __dirname,
        "./node_modules/react-quill-new",
      ),
      "motion/react": path.resolve(__dirname, "./node_modules/motion/react"),
      "@tiptap/react": path.resolve(
        __dirname,
        "./node_modules/@tiptap/react",
      ),
      "next-themes@0.4.6": "next-themes",
      "lucide-react@0.487.0": "lucide-react",
      "lucide-react": path.resolve(
        __dirname,
        "./node_modules/lucide-react",
      ),
      "input-otp@1.4.2": "input-otp",
      "embla-carousel-react@8.6.0": "embla-carousel-react",
      "cmdk@1.1.1": "cmdk",
      "class-variance-authority@0.7.1": "class-variance-authority",
      "@radix-ui/react-tooltip@1.1.8": "@radix-ui/react-tooltip",
      "@radix-ui/react-toggle@1.1.2": "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group@1.1.2": "@radix-ui/react-toggle-group",
      "@radix-ui/react-tabs@1.1.3": "@radix-ui/react-tabs",
      "@radix-ui/react-switch@1.1.3": "@radix-ui/react-switch",
      "@radix-ui/react-slot@1.1.2": "@radix-ui/react-slot",
      "@radix-ui/react-slider@1.2.3": "@radix-ui/react-slider",
      "@radix-ui/react-separator@1.1.2": "@radix-ui/react-separator",
      "@radix-ui/react-select@2.1.6": "@radix-ui/react-select",
      "@radix-ui/react-scroll-area@1.2.3": "@radix-ui/react-scroll-area",
      "@radix-ui/react-radio-group@1.2.3": "@radix-ui/react-radio-group",
      "@radix-ui/react-progress@1.1.2": "@radix-ui/react-progress",
      "@radix-ui/react-popover@1.1.6": "@radix-ui/react-popover",
      "@radix-ui/react-navigation-menu@1.2.5": "@radix-ui/react-navigation-menu",
      "@radix-ui/react-menubar@1.1.6": "@radix-ui/react-menubar",
      "@radix-ui/react-label@2.1.2": "@radix-ui/react-label",
      "@radix-ui/react-hover-card@1.1.6": "@radix-ui/react-hover-card",
      "@radix-ui/react-dropdown-menu@2.1.6": "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog@1.1.6": "@radix-ui/react-dialog",
      "@radix-ui/react-context-menu@2.2.6": "@radix-ui/react-context-menu",
      "@radix-ui/react-collapsible@1.1.3": "@radix-ui/react-collapsible",
      "@radix-ui/react-checkbox@1.1.4": "@radix-ui/react-checkbox",
      "@radix-ui/react-avatar@1.1.3": "@radix-ui/react-avatar",
      "@radix-ui/react-aspect-ratio@1.1.2": "@radix-ui/react-aspect-ratio",
      "@radix-ui/react-alert-dialog@1.1.6": "@radix-ui/react-alert-dialog",
      "@radix-ui/react-accordion@1.2.3": "@radix-ui/react-accordion",
      "react-helmet-async": path.resolve(
        __dirname,
        "./node_modules/react-helmet-async",
      ),
      "figma:asset/f36cef92f2f50ef7172a4e11c2d669c5cf616b8c.png": path.resolve(
        __dirname,
        "../src/assets/f36cef92f2f50ef7172a4e11c2d669c5cf616b8c.png",
      ),
      "figma:asset/dcada7a625a80d207e3ddd130f4b111915fb5011.png": path.resolve(
        __dirname,
        "../src/assets/dcada7a625a80d207e3ddd130f4b111915fb5011.png",
      ),
      "figma:asset/d3b5f45814466ec04f12883840ad987a5e5d22dc.png": path.resolve(
        __dirname,
        "../src/assets/d3b5f45814466ec04f12883840ad987a5e5d22dc.png",
      ),
      "figma:asset/cb85beb743df137728b4c7e481be722df9145e87.png": path.resolve(
        __dirname,
        "../src/assets/cb85beb743df137728b4c7e481be722df9145e87.png",
      ),
      "figma:asset/a5cb25c8b2f4058dc306f7d75103a264af563599.png": path.resolve(
        __dirname,
        "../src/assets/a5cb25c8b2f4058dc306f7d75103a264af563599.png",
      ),
      "figma:asset/955fda01094944745b8a5ccc1dcad7c941103fda.png": path.resolve(
        __dirname,
        "../src/assets/955fda01094944745b8a5ccc1dcad7c941103fda.png",
      ),
      "figma:asset/7c8d2a1980a9b6d0378d1a4970fa07383d4ded77.png": path.resolve(
        __dirname,
        "../src/assets/7c8d2a1980a9b6d0378d1a4970fa07383d4ded77.png",
      ),
      "figma:asset/713a974ae3548a5674493504146826237eb95429.png": path.resolve(
        __dirname,
        "../src/assets/713a974ae3548a5674493504146826237eb95429.png",
      ),
      "figma:asset/6cce818b58c05ae0468590bbf53ddfb73955cea0.png": path.resolve(
        __dirname,
        "../src/assets/6cce818b58c05ae0468590bbf53ddfb73955cea0.png",
      ),
      "figma:asset/5a7464b447a1d804d577473402b0892d3f07738a.png": path.resolve(
        __dirname,
        "../src/assets/5a7464b447a1d804d577473402b0892d3f07738a.png",
      ),
      "figma:asset/54f4c0c7adf82bdcbb2e29ba773ca1071df8a739.png": path.resolve(
        __dirname,
        "../src/assets/54f4c0c7adf82bdcbb2e29ba773ca1071df8a739.png",
      ),
      "figma:asset/4e3beab39841f6cce072c59b365308d5507baf12.png": path.resolve(
        __dirname,
        "../src/assets/4e3beab39841f6cce072c59b365308d5507baf12.png",
      ),
      "figma:asset/42925a3deff61406cc20907d68e2fb2cf131518a.png": path.resolve(
        __dirname,
        "../src/assets/42925a3deff61406cc20907d68e2fb2cf131518a.png",
      ),
      "figma:asset/3e891e453a0d1580e37c11be74bafdd01791df33.png": path.resolve(
        __dirname,
        "../src/assets/3e891e453a0d1580e37c11be74bafdd01791df33.png",
      ),
      "figma:asset/381b6517a48b79fbfbf652bac15a489fe13e8b3b.png": path.resolve(
        __dirname,
        "../src/assets/381b6517a48b79fbfbf652bac15a489fe13e8b3b.png",
      ),
      "figma:asset/2c1c79039cfd4381f506e8c95ec032cea353ba13.png": path.resolve(
        __dirname,
        "../src/assets/2c1c79039cfd4381f506e8c95ec032cea353ba13.png",
      ),
      "figma:asset/1dd67e69fdd5a0741516d99d3a59a3554a271c32.png": path.resolve(
        __dirname,
        "../src/assets/1dd67e69fdd5a0741516d99d3a59a3554a271c32.png",
      ),
      "figma:asset/1921b31ce32721bc92d5131d0a24cf7cdef54171.png": path.resolve(
        __dirname,
        "../src/assets/1921b31ce32721bc92d5131d0a24cf7cdef54171.png",
      ),
      "figma:asset/12f1929965876b365a06a763a7a59a0f9313be85.png": path.resolve(
        __dirname,
        "../src/assets/12f1929965876b365a06a763a7a59a0f9313be85.png",
      ),
      "figma:asset/112663e1163690851032de3d301c94ae217e6c4c.png": path.resolve(
        __dirname,
        "../src/assets/112663e1163690851032de3d301c94ae217e6c4c.png",
      ),
    };

    return config;
  },
};

export default nextConfig;
