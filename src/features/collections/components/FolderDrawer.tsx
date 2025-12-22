import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Folder,
	X,
	Trash2,
	Layers,
	Image as ImageIcon,
	UploadCloud,
	FolderPlus,
	CheckCircle2,
	Circle,
	FolderHeart,
	HardDrive,
	Settings,
	ChevronRight,
} from "lucide-react";
import {
	Folder as FolderType,
	Collection,
	SourceFolder,
} from "../../../shared/types";
import { Button } from "../../../shared/components/ui";

interface FolderDrawerProps {
	isOpen: boolean;
	onClose: () => void;
	folders: FolderType[];
	activeFolderId: Set<string>;
	onSelectFolder: (id: string) => void;
	onImportFolder: () => void;
	onCreateFolder: () => void;
	onDeleteFolder: (id: string) => void;
	// NEW: Collection management
	activeCollection: Collection | null;
	sourceFolders: SourceFolder[];
	onManageCollections: () => void;
	onRemoveSourceFolder?: (path: string) => void;
}

export const FolderDrawer: React.FC<FolderDrawerProps> = ({
	isOpen,
	onClose,
	folders,
	activeFolderId,
	onSelectFolder,
	onImportFolder,
	onCreateFolder,
	onDeleteFolder,
	activeCollection,
	sourceFolders,
	onManageCollections,
	onRemoveSourceFolder,
}) => {
	const totalItems = folders.reduce((acc, f) => acc + f.items.length, 0);

	// Separate shadow folders (linked to source) from manual collections
	const shadowFolders = folders.filter((f) => f.isVirtual && f.sourceFolderId);
	const manualCollections = folders.filter(
		(f) => f.isVirtual && !f.sourceFolderId
	);

	console.log(
		`[FolderDrawer] Shadow folders: ${shadowFolders.length}, Manual: ${manualCollections.length}`
	);

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
						className="fixed inset-0 bg-black/60 z-(--z-drawer-overlay) backdrop-blur-sm"
					/>

					{/* Drawer */}
					<motion.div
						initial={{ x: "-100%" }}
						animate={{ x: 0 }}
						exit={{ x: "-100%" }}
						transition={{ type: "spring", damping: 30, stiffness: 300 }}
						className="fixed top-0 left-0 bottom-0 w-80 glass-surface-lg border-r border-glass-border z-(--z-drawer) p-6 flex flex-col shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-white flex items-center gap-2">
								<Layers className="text-blue-500" /> Library
							</h2>
							<Button
								variant="ghost"
								size="icon"
								onClick={onClose}
								className="text-gray-400 hover:text-white rounded-full"
							>
								<X size={20} />
							</Button>
						</div>

						{/* Active Collection Banner */}
						{activeCollection && (
							<div className="mb-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl">
								<div className="flex items-center justify-between">
									<div className="flex-1">
										<p className="text-xs text-blue-400 font-medium uppercase tracking-wide">
											Projet Actif
										</p>
										<p className="text-sm text-white font-semibold truncate">
											{activeCollection.name}
										</p>
									</div>
									<Button
										variant="ghost"
										size="icon"
										onClick={onManageCollections}
										className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
										title="Gérer les Projets"
									>
										<Settings size={16} />
									</Button>
								</div>
							</div>
						)}

						{/* No Collection State */}
						{!activeCollection && (
							<div className="mb-4 p-4 bg-yellow-600/10 border border-yellow-500/30 rounded-xl text-center">
								<p className="text-xs text-yellow-400 mb-2">
									Aucun Projet actif
								</p>
								<Button
									variant="ghost"
									size="sm"
									onClick={onManageCollections}
									className="text-yellow-300 hover:text-yellow-200 hover:bg-yellow-500/10 underline decoration-yellow-300/30 underline-offset-2"
								>
									Créer ou sélectionner un Projet
								</Button>
							</div>
						)}

						<div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
							{/* All Photos Option */}
							<button
								onClick={() => onSelectFolder("all")}
								className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group border ${
									activeFolderId.has("all")
										? "bg-blue-600/10 border-blue-500/50 text-white shadow-lg shadow-blue-900/10"
										: "hover:bg-glass-bg-accent border-transparent text-gray-400 hover:text-white"
								}`}
							>
								<div
									className={`p-2 rounded-lg ${
										activeFolderId.has("all")
											? "bg-blue-600 text-white"
											: "bg-glass-bg-accent group-hover:bg-glass-bg-active"
									}`}
								>
									<ImageIcon size={20} />
								</div>
								<div className="flex-1 text-left">
									<p className="font-medium text-sm">Toutes les Photos</p>
									<p className="text-xs opacity-60">{totalItems} items</p>
								</div>
								{activeFolderId.has("all") ? (
									<CheckCircle2 size={18} className="text-blue-500" />
								) : (
									<Circle
										size={18}
										className="text-gray-600 group-hover:text-gray-400"
									/>
								)}
							</button>

							<div className="h-px bg-glass-border/10" />

							{/* SHADOW FOLDERS SECTION */}
							<div>
								<div className="flex items-center justify-between mb-2 px-2">
									<p className="text-xs uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
										<HardDrive size={12} />
										<span>Dossiers de Travail</span>
									</p>
									<span className="text-[10px] text-gray-600 bg-gray-800/50 px-2 py-0.5 rounded-full">
										{shadowFolders.length}
									</span>
								</div>

								{shadowFolders.length === 0 ? (
									<p className="text-xs text-gray-600 text-center py-3 italic">
										Aucun dossier de travail
									</p>
								) : (
									<div className="space-y-1">
										{shadowFolders.map((folder) => {
											const isActive = activeFolderId.has(folder.id);

											return (
												<div
													key={folder.id}
													className={`group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all text-sm ${
														isActive
															? "bg-glass-bg-active text-white border border-glass-border"
															: "text-gray-400 hover:bg-glass-bg-accent hover:text-white border border-transparent"
													}`}
													onClick={() => onSelectFolder(folder.id)}
												>
													<div
														className="shrink-0"
														onClick={(e) => {
															e.stopPropagation();
															onSelectFolder(folder.id);
														}}
													>
														{isActive ? (
															<CheckCircle2
																size={16}
																className="text-blue-500"
															/>
														) : (
															<Circle
																size={16}
																className="text-gray-600 group-hover:text-gray-400"
															/>
														)}
													</div>

													<div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-blue-500/10 border border-glass-border-light">
														<HardDrive size={16} className="text-blue-400" />
													</div>

													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<p
																className={`font-medium text-sm truncate ${
																	isActive ? "text-white" : ""
																}`}
															>
																{folder.name}
															</p>
														</div>
														<p className="text-xs opacity-60">
															{folder.items.length} items
														</p>
													</div>
												</div>
											);
										})}
									</div>
								)}
							</div>

							<div className="h-px bg-glass-border/10" />

							{/* MANUAL COLLECTIONS SECTION */}
							<div>
								<div className="flex items-center justify-between mb-2 px-2">
									<p className="text-xs uppercase text-gray-500 font-semibold tracking-wider flex items-center gap-1">
										<FolderHeart size={12} />
										<span>Collections</span>
									</p>
									{activeFolderId.size > 1 && !activeFolderId.has("all") && (
										<span className="text-blue-400 text-[10px] bg-blue-500/10 px-2 py-0.5 rounded-full">
											{activeFolderId.size} Sélectionnées
										</span>
									)}
								</div>

								{manualCollections.length === 0 ? (
									<p className="text-xs text-gray-600 text-center py-3 italic">
										Aucune collection créée
									</p>
								) : (
									<div className="space-y-1">
										{manualCollections.map((folder) => {
											const isActive = activeFolderId.has(folder.id);

											return (
												<div
													key={folder.id}
													className={`group relative flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
														isActive
															? "bg-glass-bg-active text-white border border-glass-border"
															: "text-gray-400 hover:bg-glass-bg-accent hover:text-white border border-transparent"
													}`}
													onClick={() => onSelectFolder(folder.id)}
												>
													<div
														className="shrink-0"
														onClick={(e) => {
															e.stopPropagation();
															onSelectFolder(folder.id);
														}}
													>
														{isActive ? (
															<CheckCircle2
																size={16}
																className="text-blue-500"
															/>
														) : (
															<Circle
																size={16}
																className="text-gray-600 group-hover:text-gray-400"
															/>
														)}
													</div>

													<div
														className={`w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center bg-purple-500/10 border border-glass-border-light`}
													>
														<FolderHeart
															size={16}
															className="text-purple-400"
														/>
													</div>

													<div className="flex-1 min-w-0">
														<div className="flex items-center gap-2">
															<p
																className={`font-medium text-sm truncate ${
																	isActive ? "text-white" : ""
																}`}
															>
																{folder.name}
															</p>
														</div>
														<p className="text-xs opacity-60">
															{folder.items.length} items
														</p>
													</div>

													<Button
														variant="ghost"
														size="icon"
														onClick={(e: React.MouseEvent) => {
															e.stopPropagation();
															onDeleteFolder(folder.id);
														}}
														className="opacity-0 group-hover:opacity-100 h-7 w-7 text-gray-500 hover:text-red-400 hover:bg-red-500/20"
														title="Supprimer cette collection"
													>
														<Trash2 size={14} />
													</Button>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>

						{/* Action Buttons */}
						<div className="mt-4 pt-4 border-t border-glass-border/10 space-y-2">
							<Button
								variant="ghost"
								onClick={onImportFolder}
								disabled={!activeCollection}
								leftIcon={<UploadCloud size={16} />}
								className="w-full justify-center border border-dashed border-glass-border/20 hover:border-blue-500 hover:bg-blue-500/5 text-gray-400 hover:text-white"
							>
								Ajouter un Dossier Source
							</Button>
							<Button
								variant="secondary"
								onClick={onCreateFolder}
								disabled={!activeCollection}
								leftIcon={<FolderPlus size={16} />}
								className="w-full justify-center bg-glass-bg-accent"
							>
								Nouvelle Collection Virtuelle
							</Button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
