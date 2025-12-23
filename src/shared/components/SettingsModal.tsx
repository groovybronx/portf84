import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Key, AlertTriangle, ExternalLink } from "lucide-react";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	useCinematicCarousel?: boolean;
	onToggleCinematicCarousel?: (enabled: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	useCinematicCarousel = false,
	onToggleCinematicCarousel,
}) => {
	const [apiKey, setApiKey] = useState("");
	const [isSaved, setIsSaved] = useState(false);

	useEffect(() => {
		if (isOpen) {
			const storedKey = localStorage.getItem("gemini_api_key");
			if (storedKey) setApiKey(storedKey);
			setIsSaved(false);
		}
	}, [isOpen]);

	const handleSave = () => {
		if (apiKey.trim()) {
			localStorage.setItem("gemini_api_key", apiKey.trim());
			setIsSaved(true);
			setTimeout(() => {
				setIsSaved(false);
				onClose();
			}, 800);
		} else {
			localStorage.removeItem("gemini_api_key");
		}
	};

	const handleClear = () => {
		localStorage.removeItem("gemini_api_key");
		setApiKey("");
		onClose();
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-(--z-modal-overlay)"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-background border border-white/10 rounded-2xl shadow-2xl z-(--z-modal) p-6 overflow-hidden"
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-semibold text-white flex items-center gap-2">
								<Key className="w-5 h-5 text-blue-400" />
								Settings
							</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
							>
								<X size={20} />
							</button>
						</div>

						{/* Content */}
						<div className="space-y-6">
							<div className="space-y-2">
								<label className="text-sm font-medium text-white/70">
									Google Gemini API Key
								</label>
								<div className="relative">
									<input
										type="password"
										value={apiKey}
										onChange={(e) => setApiKey(e.target.value)}
										placeholder="AIzaSy..."
										className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
									/>
								</div>
								<p className="text-xs text-white/40 leading-relaxed">
									Your key is stored locally in your browser. We never see it.
								</p>
							</div>

							<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3">
								<AlertTriangle className="w-5 h-5 text-blue-400 shrink-0" />
								<div className="text-xs text-blue-200/80 space-y-1">
									<p>To analyze images, you need a valid API key.</p>
									<a
										href="https://aistudio.google.com/app/apikey"
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 hover:underline"
									>
										Get a free key here <ExternalLink size={10} />
									</a>
								</div>
							</div>

							{/* Experimental Features */}
							{onToggleCinematicCarousel && (
								<div className="space-y-3 pt-4 border-t border-white/10">
									<h3 className="text-sm font-medium text-white/70">
										Experimental Features
									</h3>
									<label className="flex items-center justify-between cursor-pointer group">
										<div className="space-y-1">
											<div className="text-sm text-white group-hover:text-blue-400 transition-colors">
												Cinematic 3D Carousel
											</div>
											<div className="text-xs text-white/40">
												Immersive circular carousel with 3D perspective
											</div>
										</div>
										<div
											onClick={() =>
												onToggleCinematicCarousel(!useCinematicCarousel)
											}
											className={`relative w-12 h-6 rounded-full transition-colors ${
												useCinematicCarousel ? "bg-blue-500" : "bg-white/10"
											}`}
										>
											<div
												className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
													useCinematicCarousel ? "translate-x-6" : ""
												}`}
											/>
										</div>
									</label>
								</div>
							)}
						</div>

						{/* Footer */}
						<div className="mt-8 flex items-center justify-end gap-3">
							{apiKey && (
								<button
									onClick={handleClear}
									className="px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
								>
									Remove Key
								</button>
							)}
							<button
								onClick={handleSave}
								className={`relative px-6 py-2 rounded-lg font-medium text-sm text-white transition-all duration-300 overflow-hidden ${
									isSaved
										? "bg-green-500 hover:bg-green-600"
										: "bg-blue-600 hover:bg-blue-500"
								}`}
							>
								<div className="relative z-10 flex items-center gap-2">
									{isSaved ? (
										<>Saved!</>
									) : (
										<>
											<Save size={16} /> Save Changes
										</>
									)}
								</div>
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
