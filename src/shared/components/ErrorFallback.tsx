import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/Button";
import { GlassCard } from "./ui/GlassCard";

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
			<GlassCard variant="card" padding="lg" className="max-w-md w-full text-center">
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
						<Button
							onClick={onReset}
							variant="primary"
							size="md"
							icon={<RefreshCw size={16} />}
							iconPosition="left"
							className="flex-1"
						>
							Try Again
						</Button>
					)}

					{onGoHome && (
						<Button
							onClick={onGoHome}
							variant="glass"
							size="md"
							icon={<Home size={16} />}
							iconPosition="left"
							className="flex-1"
						>
							Go Home
						</Button>
					)}
				</div>
			</GlassCard>
		</motion.div>
	);
};
