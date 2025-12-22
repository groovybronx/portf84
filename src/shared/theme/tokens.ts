export const tokens = {
	colors: {
		// Brand
		primary: "#3b82f6", // blue-500
		primaryHover: "#2563eb", // blue-600
		accent: "#f59e0b", // amber-500

		// Backgrounds
		background: "#0a0a0a",
		surface: "#121212",

		// Text
		text: {
			primary: "#ffffff",
			secondary: "rgba(255, 255, 255, 0.7)",
			muted: "rgba(255, 255, 255, 0.5)",
			inverse: "#000000",
		},

		// Glassmorphism System (matches index.css)
		glass: {
			bg: "rgba(10, 10, 10, 0.8)",
			bgAccent: "rgba(255, 255, 255, 0.05)",
			bgActive: "rgba(255, 255, 255, 0.1)",
			border: "rgba(255, 255, 255, 0.1)",
			borderLight: "rgba(255, 255, 255, 0.05)",
		},

		// Semantic
		danger: "#ef4444", // red-500
		success: "#22c55e", // green-500
		warning: "#eab308", // yellow-500
	},

	typography: {
		fonts: {
			sans: '"Inter", sans-serif',
			mono: '"JetBrains Mono", monospace',
		},
		sizes: {
			xs: "0.75rem", // 12px
			sm: "0.875rem", // 14px
			md: "1rem", // 16px
			lg: "1.125rem", // 18px
			xl: "1.25rem", // 20px
			"2xl": "1.5rem", // 24px
			"3xl": "1.875rem", // 30px
		},
		weights: {
			regular: 400,
			medium: 500,
			semibold: 600,
			bold: 700,
		},
	},

	spacing: {
		1: "0.25rem",
		2: "0.5rem",
		3: "0.75rem",
		4: "1rem",
		6: "1.5rem",
		8: "2rem",
		12: "3rem",
		16: "4rem",
	},

	effects: {
		blur: {
			sm: "blur(4px)",
			md: "blur(12px)", // standard glass
			lg: "blur(24px)", // heavy glass
		},
		shadows: {
			sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
			md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
			lg: "0 10px 15px -3px rgba(0, 0, 0, 0.3)", // Deep shadow for modals
		},
		transition: {
			fast: "all 0.15s ease-in-out",
			base: "all 0.2s ease-in-out",
			slow: "all 0.3s ease-out",
		},
	},

	borders: {
		radius: {
			sm: "0.375rem",
			md: "0.5rem", // 8px
			lg: "0.75rem", // 12px
			xl: "1rem", // 16px
			full: "9999px",
		},
	},

	zIndex: {
		base: 0,
		gridItem: 10,
		carousel: 20,
		topbar: 40,
		modal: 90,
		overlay: 120,
	},
} as const;
