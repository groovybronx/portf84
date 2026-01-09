import React from "react";
import { motion } from "framer-motion";
import { FolderOpen, Sparkles } from "lucide-react";
import { GlassCard } from "./ui";

import { logger } from '../utils/logger';
interface EmptyStateProps {
	title?: string;
	description?: string;
	onAction?: () => void;
	actionLabel?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
	title = "Aucun Projet Actif",
	description = "Créez une Collection pour organiser vos images",
	onAction,
	actionLabel = "Créer une Collection",
}) => {
	return (
		<div className="flex items-center justify-center h-full min-h-[60vh]">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center space-y-6 max-w-md px-6"
			>
				{/* Animated Icon */}
				<div className="relative inline-block">
					<div className="absolute inset-0 bg-primary blur-xl opacity-20 rounded-full"></div>
					<GlassCard
						variant="accent"
						padding="lg"
						border={false}
						animate={{
							scale: [1, 1.1, 1],
							rotate: [0, 5, -5, 0],
						}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "easeInOut",
						}}
						className="relative z-10 rounded-full"
					>
						<FolderOpen className="w-16 h-16 text-primary/70" strokeWidth={1.5} />
						<motion.div
							animate={{
								opacity: [0.5, 1, 0.5],
								scale: [0.8, 1, 0.8],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
							className="absolute -top-1 -right-1"
						>
							<Sparkles className="w-6 h-6 text-yellow-400" />
						</motion.div>
					</GlassCard>
				</div>

				{/* Text Content */}
				<div className="space-y-2">
					<h3 className="text-2xl font-bold text-white">{title}</h3>
					<p className="text-gray-400 text-base leading-relaxed">
						{description}
					</p>
				</div>

				{/* Action Button */}
				{onAction && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onAction}
						className="px-6 py-3 bg-primary hover:bg-primary/80 text-white font-medium rounded-xl transition-all shadow-lg shadow-primary/30 hover:shadow-primary/50"
					>
						{actionLabel}
					</motion.button>
				)}

				{/* Decorative Elements */}
				<div className="flex justify-center gap-2 pt-4">
					{[0, 1, 2].map((i) => (
						<motion.div
							key={i}
							animate={{
								opacity: [0.3, 1, 0.3],
								scale: [0.8, 1.2, 0.8],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								delay: i * 0.3,
								ease: "easeInOut",
							}}
							className="w-2 h-2 rounded-full bg-blue-500/50"
						/>
					))}
				</div>
			</motion.div>
		</div>
	);
};
