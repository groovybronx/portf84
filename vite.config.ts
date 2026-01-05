import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, ".", "");
	return {
		server: {
			port: parseInt(env.VITE_PORT || "1420"),
			strictPort: env.VITE_STRICT_PORT !== "false",
			host: env.VITE_HOST || "0.0.0.0",
		},
		plugins: [react(), tailwindcss()],
		build: {
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							if (id.includes("framer-motion")) return "vendor-framer";
							if (id.includes("lucide-react")) return "vendor-lucide";
							if (id.includes("react") || id.includes("scheduler")) {
								return "vendor-react";
							}
							return "vendor";
						}
						return undefined;
					},
				},
			},
		},
		optimizeDeps: {
			include: ["react", "react-dom", "react/jsx-runtime"],
		},
		define: {
			"process.env.API_KEY": JSON.stringify(env.GEMINI_API_KEY),
			"process.env.GEMINI_API_KEY": JSON.stringify(env.GEMINI_API_KEY),
		},
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "./src"),
			},
		},
		test: {
			globals: true,
			environment: "jsdom",
			setupFiles: "./src/setupTests.ts",
		},
	};
});
