import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon, type IconAction, ALL_ICONS } from "./Icon";
import { open } from "@tauri-apps/plugin-dialog";
import { relaunch } from "@tauri-apps/plugin-process";
import { useTranslation } from "react-i18next";
import { useLocalShortcuts, ShortcutMap } from "../hooks/useLocalShortcuts";
import { useTheme } from "../contexts/ThemeContext";
import { secureStorage } from "../../services/secureStorage";
import { 
  SettingRow, 
  ColorPicker, 
  TabList, 
  TabTrigger, 
  IconPicker,
  Button
} from "./ui";

interface SettingsModalProps {
	isOpen: boolean;
	onClose: () => void;
	useCinematicCarousel?: boolean;
	onToggleCinematicCarousel?: (enabled: boolean) => void;
}

type SettingsTab = "general" | "language" | "appearance" | "storage" | "shortcuts";

export const SettingsModal: React.FC<SettingsModalProps> = ({
	isOpen,
	onClose,
	useCinematicCarousel = false,
	onToggleCinematicCarousel,
}) => {
	const { t, i18n } = useTranslation(['settings', 'common']);
	const [activeTab, setActiveTab] = useState<SettingsTab>("general");
	const [apiKey, setApiKey] = useState("");
	const [dbPath, setDbPath] = useState("");
	const [isSaved, setIsSaved] = useState(false);
	
	const { shortcuts, updateShortcut, resetToDefaults } = useLocalShortcuts();
	const { settings, updateSetting, resetTheme } = useTheme();

	useEffect(() => {
		if (isOpen) {
			const loadSettings = async () => {
				// Load API Key
				try {
					const secureKey = await secureStorage.getApiKey();
					if (secureKey) setApiKey(secureKey);
					else {
						// Fallback check
						const storedKey = localStorage.getItem("gemini_api_key");
						if (storedKey) setApiKey(storedKey);
					}
				} catch (e) {
					console.error("Failed to load secure key:", e);
				}

				// Load DB Path
				const storedPath = localStorage.getItem("lumina_db_path");
				if (storedPath) setDbPath(storedPath);
				else setDbPath(""); 
				
				setIsSaved(false);
			};
			loadSettings();
		}
	}, [isOpen]);

	const handleSelectDbPath = async () => {
		try {
			const selected = await open({
				directory: true,
				multiple: false,
				title: t('settings:selectDbLocation'),
			});
			if (selected && typeof selected === "string") {
				setDbPath(selected);
			}
		} catch (err) {
			console.error("Failed to pick directory:", err);
		}
	};

	const handleSave = async () => {
		if (apiKey.trim()) {
			await secureStorage.saveApiKey(apiKey.trim());
			localStorage.removeItem("gemini_api_key");
		} else {
			await secureStorage.clearApiKey();
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

	const handleClear = async () => {
		await secureStorage.clearApiKey();
		setApiKey("");
	};

    const colors = [
		{ name: t('settings:colorBlue'), value: "#3b82f6" },
		{ name: t('settings:colorPurple'), value: "#a855f7" },
		{ name: t('settings:colorEmerald'), value: "#10b981" },
		{ name: t('settings:colorRose'), value: "#f43f5e" },
		{ name: t('settings:colorAmber'), value: "#f59e0b" },
		{ name: t('settings:colorCyan'), value: "#06b6d4" },
		{ name: t('settings:colorViolet'), value: "#8b5cf6" },
		{ name: t('settings:colorFuchsia'), value: "#d946ef" },
		{ name: t('settings:colorLime'), value: "#84cc16" },
		{ name: t('settings:colorOrange'), value: "#f97316" },
	];

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
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[var(--z-modal-overlay)]"
					/>

					{/* Modal Container */}
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[600px] bg-background border border-glass-border rounded-2xl shadow-2xl z-[var(--z-modal)] overflow-hidden flex"
					>
						{/* Sidebar Navigation */}
						<TabList>
							<h2 className="text-xl font-semibold text-white px-2 mb-4 flex items-center gap-2">
								<Icon action="layout_grid" className="w-5 h-5 text-primary" />
								{t('settings:settings')}
							</h2>
							
							<TabTrigger 
								value="general" 
								active={activeTab === "general"} 
								onClick={() => setActiveTab("general")} 
								icon={<Icon action="key" size={18} />} 
							>
                                {t('settings:general')}
                            </TabTrigger>
							<TabTrigger 
								value="language"
								active={activeTab === "language"} 
								onClick={() => setActiveTab("language")} 
								icon={<Icon action="globe" size={18} />}
							>
                                {t('settings:language')}
                            </TabTrigger>
							<TabTrigger 
								value="appearance"
								active={activeTab === "appearance"} 
								onClick={() => setActiveTab("appearance")} 
								icon={<Icon action="palette" size={18} />} 
							>
                                {t('settings:appearance')}
                            </TabTrigger>
							<TabTrigger 
								value="storage"
								active={activeTab === "storage"} 
								onClick={() => setActiveTab("storage")} 
								icon={<Icon action="database" size={18} />} 
							>
                                {t('settings:storage')}
                            </TabTrigger>
							<TabTrigger 
								value="shortcuts"
								active={activeTab === "shortcuts"} 
								onClick={() => setActiveTab("shortcuts")} 
								icon={<Icon action="keyboard" size={18} />} 
							>
                                {t('settings:shortcuts')}
                            </TabTrigger>
						</TabList>

						{/* Main Content Area */}
						<div className="flex-1 flex flex-col min-w-0">
							{/* Header */}
							<div className="h-16 border-b border-glass-border flex items-center justify-between px-8 shrink-0">
								<h3 className="text-lg font-medium text-white capitalize">
									{activeTab === "general" ? t('settings:tabGeneral') : activeTab === "appearance" ? t('settings:tabAppearance') : activeTab === "storage" ? t('settings:tabStorage') : activeTab === "language" ? t('settings:language') : t('settings:tabShortcuts')}
								</h3>
								<Button
									onClick={onClose}
									variant="close"
									size="icon"
									aria-label="Close settings"
								>
									<Icon action="close" size={20} />
								</Button>
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
													{t('settings:geminiApiKey')}
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
													{t('settings:apiKeyRequired')}
												</p>
											</div>

											<div className="bg-primary/10 border border-primary/20 rounded-lg p-4 flex gap-3">
												<Icon action="alert" className="w-5 h-5 text-primary shrink-0" />
												<div className="text-xs text-primary/80 space-y-1">
													<p>{t('settings:apiKeyHelp')}</p>
													<a
														href="https://aistudio.google.com/app/apikey"
														target="_blank"
														rel="noopener noreferrer"
														className="inline-flex items-center gap-1 text-primary hover:text-primary/80 hover:underline"
													>
														{t('settings:getApiKey')} <Icon action="external_link" size={10} />
													</a>
												</div>
											</div>
											
											{apiKey && (
												<Button 
													onClick={handleClear} 
													variant="ghost"
													size="sm"
													className="text-sm text-red-400 hover:text-red-300 underline"
												>
													{t('settings:removeKey')}
												</Button>
											)}
										</div>

										{/* Experiments Section */}
										{onToggleCinematicCarousel && (
											<div className="space-y-4 pt-6 border-t border-white/10">
												<h4 className="text-sm font-medium text-white/50 uppercase tracking-wider">{t('settings:experimental')}</h4>
												<label className="flex items-center justify-between cursor-pointer group p-3 rounded-lg hover:bg-white/5 transition-colors -mx-3">
													<div className="space-y-1">
														<div className="text-sm text-white font-medium">
															{t('settings:cinematicCarousel')}
														</div>
														<div className="text-xs text-white/40">
															{t('settings:cinematicCarouselDesc')}
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

				{/* TAB: LANGUAGE */}
				{activeTab === "language" && (
					<div className="space-y-8 max-w-lg">
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-white/70">
									{t('settings:selectLanguage')}
								</label>
								<p className="text-xs text-white/40 leading-relaxed">
									{t('settings:languageDesc')}
								</p>
							</div>

							{/* Language Selection */}
							<div className="space-y-3">
								{[
									{ code: 'en', name: t('settings:langEnglish'), flag: '🇬🇧', nativeName: 'English' },
									{ code: 'fr', name: t('settings:langFrench'), flag: '🇫🇷', nativeName: 'Français' },
								].map((lang) => (
									<Button
										key={lang.code}
										onClick={() => i18n.changeLanguage(lang.code)}
										variant="glass"
										className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all group ${
											i18n.language === lang.code || i18n.language.startsWith(lang.code)
												? 'bg-primary/10 border-primary/50 ring-2 ring-primary/20'
												: 'bg-glass-bg-accent border-glass-border hover:border-glass-border-light hover:bg-glass-bg-active'
										}`}
									>
										<div className="flex items-center gap-4">
											<span className="text-4xl">{lang.flag}</span>
											<div className="text-left">
												<div className="text-sm font-semibold text-white">
													{lang.nativeName}
												</div>
												<div className="text-xs text-white/50">
													{lang.name}
												</div>
											</div>
										</div>
										{(i18n.language === lang.code || i18n.language.startsWith(lang.code)) && (
											<div className="flex items-center gap-2">
												<span className="text-xs font-medium text-primary">{t('settings:active')}</span>
												<Icon action="check" size={18} className="text-primary" />
											</div>
										)}
									</Button>
								))}
							</div>

							{/* Info Box */}
							<div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 flex gap-3 mt-6">
								<Icon action="alert" className="w-5 h-5 text-blue-400 shrink-0" />
								<div className="text-xs text-blue-200/80 space-y-1">
									<p className="font-medium">{t('settings:langSaved')}</p>
									<p className="text-blue-200/60">
										{t('settings:langSavedDesc')}
									</p>
								</div>
							</div>
						</div>
					</div>
				)}


				{/* TAB: APPEARANCE */}
				{activeTab === "appearance" && (
					<div className="space-y-8 max-w-lg">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h4 className="text-sm font-medium text-white/70">{t('settings:themeColors')}</h4>
								<Button 
									onClick={resetTheme}
									variant="ghost"
									size="sm"
									className="text-xs text-white/40 hover:text-white transition-colors"
								>
									{t('settings:resetDefaults')}
								</Button>
							</div>

							<div className="space-y-4">
                                <FormRow label={t('settings:primaryInterface')} description={t('settings:primaryInterfaceDesc')}>
                                    <ColorPicker 
                                        value={settings.primaryColor}
                                        onChange={(c) => updateSetting("primaryColor", c)}
                                        colors={colors}
                                        withIconPicker
                                        icon={settings.primaryIcon}
                                        onIconChange={(icon) => updateSetting("primaryIcon", icon)}
                                        availableIcons={ALL_ICONS}
                                        usedIcons={[settings.secondaryIcon, settings.tertiaryIcon, settings.quaternaryIcon, settings.quinaryIcon, settings.filtersIcon]}
                                    />
                                </FormRow>

                                <FormRow label={t('settings:aiIntelligence')} description={t('settings:aiIntelligenceDesc')}>
                                    <ColorPicker 
                                        value={settings.secondaryColor}
                                        onChange={(c) => updateSetting("secondaryColor", c)}
                                        colors={colors}
                                        withIconPicker
                                        icon={settings.secondaryIcon}
                                        onIconChange={(icon) => updateSetting("secondaryIcon", icon)}
                                        availableIcons={ALL_ICONS}
                                        usedIcons={[settings.primaryIcon, settings.tertiaryIcon, settings.quaternaryIcon, settings.quinaryIcon, settings.filtersIcon]}
                                    />
                                </FormRow>

                                <FormRow label={t('settings:collections')} description={t('settings:collectionsDesc')}>
                                    <ColorPicker 
                                        value={settings.tertiaryColor}
                                        onChange={(c) => updateSetting("tertiaryColor", c)}
                                        colors={colors}
                                        withIconPicker
                                        icon={settings.tertiaryIcon}
                                        onIconChange={(icon) => updateSetting("tertiaryIcon", icon)}
                                        availableIcons={ALL_ICONS}
                                        usedIcons={[settings.primaryIcon, settings.secondaryIcon, settings.quaternaryIcon, settings.quinaryIcon, settings.filtersIcon]}
                                    />
                                </FormRow>

                                <FormRow label={t('settings:workFolders')} description={t('settings:workFoldersDesc')}>
                                    <ColorPicker 
                                        value={settings.quaternaryColor}
                                        onChange={(c) => updateSetting("quaternaryColor", c)}
                                        colors={colors}
                                        withIconPicker
                                        icon={settings.quaternaryIcon}
                                        onIconChange={(icon) => updateSetting("quaternaryIcon", icon)}
                                        availableIcons={ALL_ICONS}
                                        usedIcons={[settings.primaryIcon, settings.secondaryIcon, settings.tertiaryIcon, settings.quinaryIcon, settings.filtersIcon]}
                                    />
                                </FormRow>

                                <FormRow label={t('settings:projects')} description={t('settings:projectsDesc')}>
                                    <ColorPicker 
                                        value={settings.quinaryColor}
                                        onChange={(c) => updateSetting("quinaryColor", c)}
                                        colors={colors}
                                        withIconPicker
                                        icon={settings.quinaryIcon}
                                        onIconChange={(icon) => updateSetting("quinaryIcon", icon)}
                                        availableIcons={ALL_ICONS}
                                        usedIcons={[settings.primaryIcon, settings.secondaryIcon, settings.tertiaryIcon, settings.quaternaryIcon, settings.filtersIcon]}
                                    />
                                </FormRow>
							</div>
						</div>

						<div className="space-y-4 pt-6 border-t border-glass-border">
							<div className="flex justify-between items-center">
								<h4 className="text-sm font-medium text-white/70">{t('settings:glassOpacity')}</h4>
								<span className="text-xs text-white/40">{settings.glassBg.includes("0.9") ? t('settings:high') : settings.glassBg.includes("0.5") ? t('settings:low') : t('settings:medium')}</span>
							</div>
							<div className="flex gap-2 bg-glass-bg-accent p-1 rounded-lg border border-glass-border-light">
								{[
									{ label: t('settings:highCoverage'), value: "rgba(10, 10, 10, 0.95)" },
									{ label: t('settings:balanced'), value: "rgba(10, 10, 10, 0.8)" },
									{ label: t('settings:frosted'), value: "rgba(10, 10, 10, 0.5)" },
								].map((option) => (
									<Button
										key={option.value}
										onClick={() => updateSetting("glassBg", option.value)}
										variant="ghost"
										size="sm"
										className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
											settings.glassBg === option.value
												? "bg-white/10 text-white shadow-sm"
												: "text-white/40 hover:text-white/70"
										}`}
									>
										{option.label}
									</Button>
								))}
							</div>
						</div>
	
						
						<div className="pt-6 border-t border-glass-border">
						    <Button 
						        onClick={resetTheme}
						        variant="ghost"
						        size="sm"
						        className="text-xs text-red-400 hover:text-red-300 underline flex items-center gap-2"
						    >
						        <Icon action="reset" size={12} /> {t('settings:resetTheme')}
						    </Button>
						</div>
					</div>
				)}

				{/* TAB: STORAGE */}
				{activeTab === "storage" && (
					<div className="space-y-8 max-w-lg">
						<div className="space-y-4">
							<div className="space-y-2">
								<label className="text-sm font-medium text-white/70">
									{t('settings:databaseLocation')}
								</label>
								<div className="flex gap-2">
									<input
										type="text"
										readOnly
										value={dbPath || t('settings:defaultFolder')}
										className="flex-1 bg-glass-bg-accent border border-glass-border rounded-lg px-4 py-3 text-white/50 text-xs font-mono truncate cursor-not-allowed"
									/>
									<Button
										onClick={handleSelectDbPath}
										variant="glass"
										size="md"
										className="whitespace-nowrap"
									>
										{t('settings:change')}
									</Button>
								</div>
							</div>
							
							{dbPath && (
								<div className="flex justify-between items-center bg-amber-500/10 p-4 rounded-lg border border-amber-500/20">
									<p className="text-xs text-amber-200 flex items-center gap-2">
										<Icon action="alert" size={14} /> {t('settings:restartRequired')}
									</p>
									<div className="flex gap-3 items-center">
										<Button 
											onClick={() => setDbPath("")}
											variant="ghost"
											size="sm"
											className="text-xs text-white/50 hover:text-white underline"
										>
											{t('settings:resetDefault')}
										</Button>
										<Button
											onClick={async () => {
												if (dbPath) localStorage.setItem("lumina_db_path", dbPath);
												await relaunch();
											}}
											variant="primary"
											size="sm"
											className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-lg"
										>
											{t('settings:restartNow')}
										</Button>
									</div>
								</div>
							)}
							
							<div className="text-xs text-white/40 space-y-2 leading-relaxed p-4 bg-white/5 rounded-lg">
								<p><strong>Note:</strong> {t('settings:dbNote')}</p>
								<p>{t('settings:dbNoteUseful')}</p>
							</div>
						</div>
					</div>
				)}

				{/* TAB: SHORTCUTS */}
				{activeTab === "shortcuts" && (
					<div className="space-y-6 max-w-2xl">
						<div className="flex justify-between items-end border-b border-white/10 pb-4">
							<p className="text-sm text-white/60">{t('settings:customizeWorkflow')}</p>
							<Button 
								onClick={resetToDefaults}
								variant="ghost"
								size="sm"
								className="text-xs flex items-center gap-1.5 text-white/40 hover:text-white transition-colors"
							>
								<Icon action="reset" size={12} /> {t('settings:resetDefaults')}
							</Button>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
							{/* Group: Navigation */}
							<div className="space-y-4">
								<h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">{t('settings:navigation')}</h4>
								<div className="space-y-3">
									<ShortcutRow label={t('settings:moveUp')} action="NAV_UP" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:moveDown')} action="NAV_DOWN" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:moveLeft')} action="NAV_LEFT" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:moveRight')} action="NAV_RIGHT" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:openFullscreen')} action="OPEN_VIEW" shortcuts={shortcuts} update={updateShortcut} />
								</div>
							</div>

							{/* Group: Tagging */}
							<div className="space-y-4">
								<h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider">{t('settings:colorTags')}</h4>
								<div className="space-y-3">
									<ShortcutRow label={t('settings:red')} action="TAG_RED" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:orange')} action="TAG_ORANGE" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:yellow')} action="TAG_YELLOW" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:green')} action="TAG_GREEN" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:blue')} action="TAG_BLUE" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:purple')} action="TAG_PURPLE" shortcuts={shortcuts} update={updateShortcut} />
									<ShortcutRow label={t('settings:clearTag')} action="TAG_REMOVE" shortcuts={shortcuts} update={updateShortcut} />
								</div>
							</div>
						</div>
					</div>
				)}
							</div>

							{/* Footer Actions (Global) */}
							<div className="p-6 border-t border-glass-border flex justify-end gap-3 bg-background/50 backdrop-blur-md">
								<Button
									onClick={handleSave}
									variant="primary"
									size="md"
									className={`relative px-6 py-2.5 transition-all duration-300 overflow-hidden shadow-lg ${
										isSaved
											? "bg-green-500 hover:bg-green-600"
											: ""
									}`}
									leftIcon={!isSaved ? <Icon action="save" size={16} /> : undefined}
								>
									{isSaved ? t('settings:saved') : t('settings:saveChanges')}
								</Button>
							</div>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};

// Wrapper for Settings Row to match previous layout
const FormRow = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
    <div className="bg-glass-bg-accent rounded-xl p-3 border border-glass-border-light">
        <div className="mb-3">
            <div className="text-sm font-medium text-white">{label}</div>
            <div className="text-[10px] text-white/40">{description}</div>
        </div>
        {children}
    </div>
);

// Helper for Shortcuts to clean up main component
const ShortcutRow = ({ label, action, shortcuts, update }: { label: string, action: keyof ShortcutMap, shortcuts: ShortcutMap, update: (action: keyof ShortcutMap, keys: string[]) => void }) => {
    return (
        <div className="flex items-center justify-between group">
            <span className="text-sm text-white/70 group-hover:text-white transition-colors">{label}</span>
            <Button
                variant="glass"
                size="sm"
                className="px-3 py-1.5 text-xs font-mono text-primary min-w-12 text-center focus:ring-2 focus:ring-primary"
                onClick={() => {
                   // Simple prompt for now, could be improved with a key recorder
                   const key = prompt("Press a key (e.g., ArrowUp, a, b, Enter)");
                   if (key) update(action, [key]);
                }}
            >
                {shortcuts[action] ? shortcuts[action].join(" + ") : "..."}
            </Button>
        </div>
    );
};

