import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "./Icon";
import { open } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { useLocalShortcuts, ShortcutMap } from "../hooks/useLocalShortcuts";
import { useTheme } from "../../contexts/ThemeContext";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	useCinematicCarousel?: boolean;
	onToggleCinematicCarousel?: (enabled: boolean) => void;
}

type SettingsTab = "general" | "appearance" | "storage" | "shortcuts";

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	useCinematicCarousel = false,
	onToggleCinematicCarousel,
}) => {
	const [activeTab, setActiveTab] = useState<SettingsTab>("general");
	const [apiKey, setApiKey] = useState("");
	const [dbPath, setDbPath] = useState("");
	const [isSaved, setIsSaved] = useState(false);
	
	const { shortcuts, updateShortcut, resetToDefaults } = useLocalShortcuts();
	const { settings, updateSetting, resetTheme } = useTheme();

	useEffect(() => {
		if (isOpen) {
			const storedKey = localStorage.getItem("gemini_api_key");
			const storedPath = localStorage.getItem("lumina_db_path");
			if (storedKey) setApiKey(storedKey);
			if (storedPath) setDbPath(storedPath);
			else setDbPath(""); 
			setIsSaved(false);
		}
	}, [isOpen]);

	const handleSelectDbPath = async () => {
		try {
			const selected = await open({
				directory: true,
				multiple: false,
				title: "Select Database Location",
			});
			if (selected && typeof selected === "string") {
				setDbPath(selected);
			}
		} catch (err) {
			console.error("Failed to pick directory:", err);
		}
	};

	const handleSave = () => {
		if (apiKey.trim()) {
			localStorage.setItem("gemini_api_key", apiKey.trim());
		} else {
			localStorage.removeItem("gemini_api_key");
		}

		if (dbPath) {
			localStorage.setItem("lumina_db_path", dbPath);
		} else {
			localStorage.removeItem("lumina_db_path");
		}

		setIsSaved(true);
		setTimeout(() => {
			setIsSaved(false);
			onClose();
		}, 800);
	};

	const handleClear = () => {
		localStorage.removeItem("gemini_api_key");
		setApiKey("");
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

					{/* Modal Container */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-background border border-glass-border rounded-2xl shadow-2xl z-(--z-modal) overflow-hidden flex"
					>
						{/* Sidebar Navigation */}
						<div className="w-64 bg-glass-bg-accent border-r border-glass-border p-4 flex flex-col gap-2">
							<h2 className="text-xl font-semibold text-white px-2 mb-4 flex items-center gap-2">
								<Icon action="layout_grid" className="w-5 h-5 text-primary" />
								Settings
							</h2>
							
							<NavButton 
								active={activeTab === "general"} 
								onClick={() => setActiveTab("general")} 
								icon={<Icon action="key" size={18} />} 
								label="General & AI" 
							/>
							<NavButton 
								active={activeTab === "appearance"} 
								onClick={() => setActiveTab("appearance")} 
								icon={<Icon action="palette" size={18} />} // using palette or Grid? I added layout_grid. Palette is not in registry. I should use `brush` or reuse `layout_grid`? Or add `palette`.
								label="Appearance" 
							/>
							<NavButton 
								active={activeTab === "storage"} 
								onClick={() => setActiveTab("storage")} 
								icon={<Icon action="database" size={18} />} 
								label="Storage" 
							/>
							<NavButton 
								active={activeTab === "shortcuts"} 
								onClick={() => setActiveTab("shortcuts")} 
								icon={<Icon action="keyboard" size={18} />} 
								label="Shortcuts" 
							/>
						</div>

						{/* Main Content Area */}
						<div className="flex-1 flex flex-col min-w-0">
							{/* Header */}
							<div className="h-16 border-b border-glass-border flex items-center justify-between px-8 shrink-0">
								<h3 className="text-lg font-medium text-white capitalize">
									{activeTab === "general" ? "General Settings" : activeTab === "appearance" ? "Appearance & Theme" : activeTab === "storage" ? "Storage Configuration" : "Keyboard Shortcuts"}
								</h3>
								<button
									onClick={onClose}
									className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white"
								>
									<Icon action="close" size={20} />
								</button>
							</div>

							{/* Scrollable Content */}
							<div className="flex-1 overflow-y-auto p-8">
								
								{/* TAB: GENERAL */}
								{activeTab === "general" && (
									<div className="space-y-8 max-w-lg">
										{/* API Key Section */}
										<div className="space-y-4">
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
														className="w-full bg-glass-bg-accent border border-glass-border rounded-lg px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-sm"
													/>
												</div>
												<p className="text-xs text-white/40 leading-relaxed">
													Required for AI Vision analysis features. Stored locally.
												</p>
											</div>

											<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
												<Icon action="alert" className="w-5 h-5 text-primary shrink-0" />
												<div className="text-xs text-primary/80 space-y-1">
													<p>Don't have a key?</p>
													<a
														href="https://aistudio.google.com/app/apikey"
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline"
													>
														Get a free Gemini API key <Icon action="external_link" size={10} />
													</a>
												</div>
											</div>
											
											{apiKey && (
												<button onClick={handleClear} className="text-sm text-red-400 hover:text-red-300 underline">
													Remove Stored Key
												</button>
											)}
										</div>

										{/* Experiments Section */}
										{onToggleCinematicCarousel && (
											<div className="space-y-4 pt-6 border-t border-white/10">
												<h4 className="text-sm font-medium text-white/50 uppercase tracking-wider">Experimental</h4>
												<label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors -mx-3">
													<div className="space-y-1">
														<div className="text-sm text-white font-medium">
															Cinematic 3D Carousel
														</div>
														<div className="text-xs text-white/40">
															Enable immersive 3D perspective view
														</div>
													</div>
													<div
														onClick={() => onToggleCinematicCarousel(!useCinematicCarousel)}
														className={`relative w-11 h-6 rounded-full transition-colors ${
															useCinematicCarousel ? "bg-blue-500" : "bg-white/10"
														}`}
													>
														<div
															className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
																useCinematicCarousel ? "translate-x-5" : ""
															}`}
														/>
													</div>
												</label>
											</div>
										)}
								

									</div>
								)}

								{/* TAB: APPEARANCE */}
								{activeTab === "appearance" && (
									<div className="space-y-8 max-w-lg">
										<div className="space-y-4">
											<h4 className="text-sm font-medium text-white/70">Accent Color</h4>
											<div className="grid grid-cols-5 gap-3">
												{[
													{ name: "Blue", value: "#3b82f6" },
													{ name: "Purple", value: "#a855f7" },
													{ name: "Emerald", value: "#10b981" },
													{ name: "Rose", value: "#f43f5e" },
													{ name: "Amber", value: "#f59e0b" },
													{ name: "Cyan", value: "#06b6d4" },
													{ name: "Violet", value: "#8b5cf6" },
													{ name: "Fuchsia", value: "#d946ef" },
													{ name: "Lime", value: "#84cc16" },
													{ name: "Orange", value: "#f97316" },
												].map((color) => (
													<button
														key={color.value}
														onClick={() => updateSetting("primaryColor", color.value)}
														className={`h-10 rounded-lg border flex items-center justify-center transition-all ${
															settings.primaryColor === color.value
																? "border-white ring-2 ring-white/20 scale-105"
																: "border-transparent hover:scale-105 opacity-80 hover:opacity-100"
														}`}
														style={{ backgroundColor: color.value }}
														title={color.name}
													>
														{settings.primaryColor === color.value && (
															<Icon action="check_circle" className="text-white drop-shadow-md" size={16} />
														)}
													</button>
												))}
											</div>
										</div>

										<div className="space-y-4 pt-6 border-t border-glass-border">
											<div className="flex justify-between items-center">
												<h4 className="text-sm font-medium text-white/70">Glass Opacity</h4>
												<span className="text-xs text-white/40">{settings.glassBg.includes("0.9") ? "High" : settings.glassBg.includes("0.5") ? "Low" : "Medium"}</span>
											</div>
											<div className="flex gap-2 bg-glass-bg-accent p-1 rounded-lg border border-glass-border-light">
												{[
													{ label: "High Coverage", value: "rgba(10, 10, 10, 0.95)" },
													{ label: "Balanced", value: "rgba(10, 10, 10, 0.8)" },
													{ label: "Frosted", value: "rgba(10, 10, 10, 0.5)" },
												].map((option) => (
													<button
														key={option.value}
														onClick={() => updateSetting("glassBg", option.value)}
														className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
															settings.glassBg === option.value
																? "bg-white/10 text-white shadow-sm"
																: "text-white/40 hover:text-white/70"
														}`}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>
										
										<div className="pt-6 border-t border-glass-border">
										    <button 
										        onClick={resetTheme}
										        className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-2"
										    >
										        <Icon action="reset" size={12} /> Reset Theme to Defaults
										    </button>
										</div>
									</div>
								)}

								{/* TAB: STORAGE */}
								{activeTab === "storage" && (
									<div className="space-y-8 max-w-lg">
										<div className="space-y-4">
											<div className="space-y-2">
												<label className="text-sm font-medium text-white/70">
													Database Location
												</label>
												<div className="flex gap-2">
													<input
														type="text"
														readOnly
														value={dbPath || "Default System Folder"}
														className="flex-1 bg-glass-bg-accent border border-glass-border rounded-lg px-4 py-3 text-white/50 text-xs font-mono truncate cursor-not-allowed"
													/>
													<button
														onClick={handleSelectDbPath}
														className="px-4 py-2 bg-glass-bg hover:bg-glass-bg-active border border-glass-border rounded-lg text-white text-sm transition-colors whitespace-nowrap"
													>
														Change...
													</button>
												</div>
											</div>
											
											{dbPath && (
												<div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
													<p className="text-xs text-amber-200 flex items-center gap-2">
														<Icon action="alert" size={14} /> Restart required
													</p>
													<div className="flex gap-3 items-center">
														<button 
															onClick={() => setDbPath("")}
															className="text-xs text-white/50 hover:text-white underline"
														>
															Reset Default
														</button>
														<button
															onClick={async () => {
																if (dbPath) localStorage.setItem("lumina_db_path", dbPath);
																await relaunch();
															}}
															className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded shadow-lg transition-transform active:scale-95"
														>
															Restart Now
														</button>
													</div>
												</div>
											)}
											
											<div className="text-xs text-white/40 space-y-2 leading-relaxed p-4 bg-white/5 rounded-lg">
												<p><strong>Note:</strong> Moving the database location will create a new, empty library at the destination. Your existing data will remain in the default location but won't be visible.</p>
												<p>Useful if you want to store your library index on an external portable drive.</p>
											</div>
										</div>
									</div>
								)}

								{/* TAB: SHORTCUTS */}
								{activeTab === "shortcuts" && (
									<div className="space-y-6 max-w-2xl">
										<div className="flex justify-between items-end border-b border-white/10 pb-4">
											<p className="text-sm text-white/60">Customize your workflow. Click on a key to rebind it.</p>
											<button 
												onClick={resetToDefaults}
												className="text-xs flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
											>
												<Icon action="reset" size={12} /> Reset to Defaults
											</button>
										</div>

										<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
											{/* Group: Navigation */}
											<div className="space-y-4">
												<h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Navigation</h4>
												<div className="space-y-3">
													<KeyRow label="Move Up" action="NAV_UP" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Move Down" action="NAV_DOWN" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Move Left" action="NAV_LEFT" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Move Right" action="NAV_RIGHT" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Open / Fullscreen" action="OPEN_VIEW" shortcuts={shortcuts} update={updateShortcut} />
												</div>
											</div>

											{/* Group: Tagging */}
											<div className="space-y-4">
												<h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">Color Tags</h4>
												<div className="space-y-3">
													<KeyRow label="Red" action="TAG_RED" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Orange" action="TAG_ORANGE" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Yellow" action="TAG_YELLOW" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Green" action="TAG_GREEN" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Blue" action="TAG_BLUE" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Purple" action="TAG_PURPLE" shortcuts={shortcuts} update={updateShortcut} />
													<KeyRow label="Clear Tag" action="TAG_REMOVE" shortcuts={shortcuts} update={updateShortcut} />
												</div>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* Footer Actions (Global) */}
							<div className="p-6 border-t border-glass-border flex justify-end gap-3 bg-background/50 backdrop-blur-md">
								<button
									onClick={handleSave}
									className={`relative px-6 py-2.5 rounded-lg font-medium text-sm text-white transition-all duration-300 overflow-hidden shadow-lg ${
										isSaved
											? "bg-green-500 hover:bg-green-600"
											: "bg-primary hover:bg-primary/80"
									}`}
								>
									<div className="relative z-10 flex items-center gap-2">
										{isSaved ? (
											<>Saved!</>
										) : (
											<>
												<Icon action="save" size={16} /> Save Changes
											</>
										)}
									</div>
								</button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

// --- Subcomponents ---

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
	<button
		onClick={onClick}
		className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
			active 
			? "bg-primary/20 text-primary border border-primary/30"  
			: "text-white/60 hover:text-white hover:bg-white/5 active:bg-white/10"
		}`}
	>
		{icon}
		{label}
	</button>
);

const KeyRow = ({ label, action, shortcuts, update }: { label: string, action: keyof ShortcutMap, shortcuts: ShortcutMap, update: (k: keyof ShortcutMap, v: string[]) => void }) => {
	const currentKey = shortcuts[action][0] || "None";
	const [isListening, setIsListening] = useState(false);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		e.preventDefault();
		e.stopPropagation();
		// Capture key
		update(action, [e.key]);
		setIsListening(false);
	};

	return (
		<div className="flex items-center justify-between group">
			<span className="text-sm text-white/80 group-hover:text-white transition-colors">{label}</span>
			<button
				onClick={() => setIsListening(true)}
				onBlur={() => setIsListening(false)}
				onKeyDown={isListening ? handleKeyDown : undefined}
				className={`min-w-[80px] h-8 px-3 rounded text-xs font-mono border transition-all flex items-center justify-center ${
					isListening 
					? "bg-primary text-white border-primary ring-2 ring-primary/30" 
					: "bg-white/5 text-white/70 border-white/10 hover:border-white/30 hover:bg-white/10"
				}`}
			>
				{isListening ? "Press key..." : formatKeyLabel(currentKey)}
			</button>
		</div>
	);
};

const formatKeyLabel = (key: string) => {
	if (key === " ") return "Space";
	if (key === "ArrowUp") return "↑";
	if (key === "ArrowDown") return "↓";
	if (key === "ArrowLeft") return "←";
	if (key === "ArrowRight") return "→";
	return key.toUpperCase();
};
