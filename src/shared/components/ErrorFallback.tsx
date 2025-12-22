import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorFallbackProps {
	error: Error | null;
	featureName?: string;
	onReset?: () => void;
	onGoHome?: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
	error,
	featureName,
	onReset,
	onGoHome,
}) => {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			className="flex items-center justify-center min-h-[400px] p-8"
		>
			<div className="max-w-md w-full bg-glass-bg border border-glass-border rounded-xl p-8 text-center">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
					<AlertTriangle size={32} className="text-red-400" />
				</div>

				<h2 className="text-xl font-semibold text-white mb-2">
					Something Went Wrong
				</h2>

				<p className="text-gray-400 text-sm mb-4">
					{featureName
						? `An error occurred in the ${featureName} feature.`
						: "An unexpected error occurred."}
				</p>

				{error && (
					<details className="mb-6 text-left">
						<summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
							Error Details
						</summary>
						<pre className="mt-2 p-3 bg-black/50 rounded text-xs text-red-300 overflow-auto max-h-32">
							{error.message}
						</pre>
					</details>
				)}

				<div className="flex gap-3 justify-center">
					{onReset && (
						<button
							onClick={onReset}
							className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
						>
							<RefreshCw size={16} />
							Try Again
						</button>
					)}

					{onGoHome && (
						<button
							onClick={onGoHome}
							className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-glass-bg-accent hover:bg-glass-bg-active text-white rounded-lg transition-colors border border-glass-border-light"
						>
							<Home size={16} />
							Go Home
						</button>
					)}
				</div>
			</div>
		</motion.div>
	);
};
