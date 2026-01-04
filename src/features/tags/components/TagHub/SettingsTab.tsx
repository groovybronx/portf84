import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon, Save } from "lucide-react";
import { Button } from "@/shared/components/ui";
import {
  loadTagSettings,
  saveTagSettings,
  resetTagSettings,
  DEFAULT_TAG_SETTINGS,
  type TagSettings
} from "@/shared/utils/tagSettings";

export const SettingsTab: React.FC = () => {
	const { t } = useTranslation(["tags", "common"]);
	const [settings, setSettings] = useState<TagSettings>(() => loadTagSettings());
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Load on mount (in case initialization didn't catch separate tab mount behavior, though lazy init usually works)
    useEffect(() => {
        const loaded = loadTagSettings();
        setSettings(loaded);
    }, []);

    const debouncedSave = useCallback((newSettings: TagSettings) => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => {
            saveTagSettings(newSettings);
        }, 500);
    }, []);

    const updateSettings = (newSettings: TagSettings) => {
        setSettings(newSettings);
        debouncedSave(newSettings);
    };

	const handlePresetChange = (preset: "strict" | "balanced" | "aggressive") => {
		const presets = {
			strict: { levenshteinThreshold: 1, jaccardThreshold: 90, minUsageCount: 5 },
			balanced: { levenshteinThreshold: 2, jaccardThreshold: 80, minUsageCount: 1 },
			aggressive: { levenshteinThreshold: 3, jaccardThreshold: 60, minUsageCount: 0 },
		};
        // Explicitly cast the preset properties to match TagSettings types if needed,
        // but since TagSettings numbers match, it should be fine.
		updateSettings({ ...settings, similarityPreset: preset, ...presets[preset] } as TagSettings); // Cast to help TS if strict
	};

	const handleSave = () => {
        // Force save immediately
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
		saveTagSettings(settings);
		alert(t("tags:settingsSavedSuccess"));
	};

	const handleReset = () => {
		if (confirm(t("tags:confirmResetSettings" as any))) {
			const defaults = resetTagSettings();
			setSettings(defaults);
		}
	};

	return (
		<div className="p-6 space-y-6">
			{/* Similarity Detection */}
			<section className="space-y-4">
				<h3 className="text-lg font-semibold text-white flex items-center gap-2">
					<SettingsIcon size={20} className="text-blue-400" />
					{t("tags:similarityDetection")}
				</h3>

				<div className="bg-glass-bg-accent border border-glass-border rounded-lg p-4 space-y-4">
					{/* Preset Selection */}
					<div>
						<label className="text-sm text-gray-400 block mb-2">
							{t("tags:preset")}
						</label>
						<div className="flex gap-3">
							{["strict", "balanced", "aggressive"].map((preset) => (
								<Button
									key={preset}
									onClick={() =>
										handlePresetChange(preset as "strict" | "balanced" | "aggressive")
									}
									className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
										settings.similarityPreset === preset
											? "bg-blue-500/20 text-blue-300 border border-blue-500/50"
											: "bg-glass-bg text-gray-400 hover:bg-glass-bg-accent"
									}`}
								>
									{t(`tags:${preset}` as any)}
								</Button>
							))}
						</div>
					</div>

					{/* Levenshtein Threshold */}
					<div>
						<div className="flex justify-between mb-2">
							<label className="text-sm text-gray-400">
								{t("tags:levenshteinThreshold")}
							</label>
							<span className="text-sm text-white font-medium">
								{settings.levenshteinThreshold}
							</span>
						</div>
						<input
							type="range"
							min="1"
							max="3"
							value={settings.levenshteinThreshold}
							onChange={(e) =>
								updateSettings({ ...settings, levenshteinThreshold: Number(e.target.value) })
							}
							className="w-full"
						/>
						<p className="text-xs text-gray-500 mt-1">
							{t("tags:levenshteinHelp")}
						</p>
					</div>

					{/* Jaccard Threshold */}
					<div>
						<div className="flex justify-between mb-2">
							<label className="text-sm text-gray-400">{t("tags:jaccardThreshold")}</label>
							<span className="text-sm text-white font-medium">
								{settings.jaccardThreshold}%
							</span>
						</div>
						<input
							type="range"
							min="60"
							max="95"
							value={settings.jaccardThreshold}
							onChange={(e) =>
								updateSettings({ ...settings, jaccardThreshold: Number(e.target.value) })
							}
							className="w-full"
						/>
						<p className="text-xs text-gray-500 mt-1">
							{t("tags:jaccardHelp")}
						</p>
					</div>

					{/* Min Usage Count */}
					<div>
						<div className="flex justify-between mb-2">
							<label className="text-sm text-gray-400">{t("tags:minUsageCount")}</label>
							<span className="text-sm text-white font-medium">{settings.minUsageCount}</span>
						</div>
						<input
							type="range"
							min="0"
							max="10"
							value={settings.minUsageCount}
							onChange={(e) =>
								updateSettings({ ...settings, minUsageCount: Number(e.target.value) })
							}
							className="w-full"
						/>
						<p className="text-xs text-gray-500 mt-1">
							{t("tags:minUsageHelp")}
						</p>
					</div>

					{/* Semantic Similarity Toggle */}
					<div className="flex items-center justify-between pt-2 border-t border-white/10">
						<span className="text-sm text-gray-400">
							{t("tags:enableSemanticSimilarity")}
						</span>
						<Button
							onClick={() =>
								updateSettings({
									...settings,
									enableSemanticSimilarity: !settings.enableSemanticSimilarity,
								})
							}
							className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
								settings.enableSemanticSimilarity
									? "bg-green-500/20 text-green-300 border border-green-500/50"
									: "bg-glass-bg text-gray-500 border border-white/10"
							}`}
						>
							{settings.enableSemanticSimilarity
								? t("common:enabled")
								: t("common:disabled")}
						</Button>
					</div>
				</div>
			</section>

			{/* Preferences */}
			<section className="space-y-4">
				<h3 className="text-lg font-semibold text-white">{t("tags:preferences")}</h3>

				<div className="bg-glass-bg-accent border border-glass-border rounded-lg p-4 space-y-3">
					{[
						{
							key: "showAITagsSeparately" as keyof TagSettings,
							label: t("tags:showAITagsSeparately"),
						},
						{
							key: "suggestAliasesWhileTyping" as keyof TagSettings,
							label: t("tags:suggestAliasesWhileTyping"),
						},
						{
							key: "autoMergeObviousDuplicates" as keyof TagSettings,
							label: t("tags:autoMergeObviousDuplicates"),
						},
						{
							key: "confirmBeforeMerge" as keyof TagSettings,
							label: t("tags:confirmBeforeMerge"),
						},
					].map(({ key, label }) => (
						<div key={key} className="flex items-center justify-between py-2">
							<span className="text-sm text-gray-400">{label}</span>
							<Button
								onClick={() => updateSettings({ ...settings, [key]: !settings[key] })}
								className={`w-12 h-6 rounded-full transition-all relative ${
									settings[key] ? "bg-blue-500" : "bg-gray-600"
								}`}
							>
								<div
									className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
										settings[key] ? "left-6" : "left-0.5"
									}`}
								/>
							</Button>
						</div>
					))}
				</div>
			</section>

			{/* Action Buttons */}
			<div className="flex items-center justify-between pt-4 border-t border-white/10">
				<Button
					onClick={handleReset}
					className="px-4 py-2 bg-glass-bg-accent hover:bg-glass-bg-accent-hover text-gray-400 hover:text-gray-300 text-sm rounded-lg border border-white/10 transition-colors"
				>
					{t("tags:resetToDefaults")}
				</Button>
				<Button
					onClick={handleSave}
					className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm rounded-lg flex items-center gap-2 transition-all active:scale-95"
				>
					<Save size={16} />
					{t("tags:saveSettings")}
				</Button>
			</div>
		</div>
	);
};
