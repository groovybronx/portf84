import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
	X,
	Plus,
	Trash2,
	Folder,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";
import { Collection } from "../../../shared/types";

interface CollectionManagerProps {
	isOpen: boolean;
	onClose: () => void;
	collections: Collection[];
	activeCollection: Collection | null;
	onCreateCollection: (name: string) => Promise<void>;
	onSwitchCollection: (id: string) => Promise<void>;
	onDeleteCollection: (id: string) => Promise<void>;
}

export const CollectionManager: React.FC<CollectionManagerProps> = ({
	isOpen,
	onClose,
	collections,
	activeCollection,
	onCreateCollection,
	onSwitchCollection,
	onDeleteCollection,
}) => {
	const { t } = useTranslation(["library", "common"]);
	const [isCreating, setIsCreating] = useState(false);
	const [newCollectionName, setNewCollectionName] = useState("");
	const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

	const handleCreate = async () => {
		if (!newCollectionName.trim()) return;

		try {
			await onCreateCollection(newCollectionName);
			setNewCollectionName("");
			setIsCreating(false);
		} catch (error) {
			console.error("Failed to create collection:", error);
		}
	};

	const handleDelete = async (id: string) => {
		try {
			await onDeleteCollection(id);
			setDeleteConfirm(null);
		} catch (error) {
			console.error("Failed to delete collection:", error);
		}
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
						className="fixed inset-0 bg-black/60 z-(--z-drawer-overlay) backdrop-blur-sm"
					/>

					{/* Modal */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.9, y: 20 }}
						transition={{ type: "spring", damping: 25, stiffness: 300 }}
						className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md glass-surface-lg border border-glass-border z-(--z-modal) p-6 rounded-2xl shadow-2xl"
					>
						{/* Header */}
						<div className="flex items-center justify-between mb-6">
							<h2 className="text-xl font-bold text-white flex items-center gap-2">
								<Folder className="text-primary" />
								{t('library:myProjects')}
							</h2>
							<button
								onClick={onClose}
								className="p-2 hover:bg-glass-bg-accent rounded-full text-gray-400 hover:text-white transition-colors"
							>
								<X size={20} />
							</button>
						</div>

						{/* Collections List */}
						<div className="space-y-2 mb-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
							{collections.length === 0 ? (
								<p className="text-sm text-gray-500 text-center py-8 italic">
									{t('library:noProjectsCreated')}
								</p>
							) : (
								collections.map((collection) => {
									const isActive = activeCollection?.id === collection.id;
									const isDeleting = deleteConfirm === collection.id;

									return (
										<motion.div
											key={collection.id}
											layout
											initial={{ opacity: 0, x: -20 }}
											animate={{ opacity: 1, x: 0 }}
											exit={{ opacity: 0, x: 20 }}
											className={`relative group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
												isActive
													? "bg-primary/10 border-primary/50 text-white"
													: "hover:bg-glass-bg-accent border-transparent text-gray-400 hover:text-white"
											}`}
											onClick={() =>
												!isActive && onSwitchCollection(collection.id)
											}
										>
											{/* Active Indicator */}
											{isActive && (
												<CheckCircle2
													size={18}
													className="text-primary shrink-0"
												/>
											)}

											{/* Collection Name */}
											<div className="flex-1 min-w-0">
												<p
													className={`font-medium text-sm truncate ${
														isActive ? "text-white" : ""
													}`}
												>
													{collection.name}
												</p>
												<p className="text-xs opacity-60">
													{new Date(collection.createdAt).toLocaleDateString()}
												</p>
											</div>

											{/* Delete Button */}
											{!isActive && (
												<button
													onClick={(e) => {
														e.stopPropagation();
														setDeleteConfirm(collection.id);
													}}
													className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all shrink-0"
												>
													<Trash2 size={16} />
												</button>
											)}

											{/* Delete Confirmation */}
											{isDeleting && (
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													className="absolute inset-0 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center justify-center gap-2 px-3"
												>
													<AlertCircle size={16} className="text-red-400" />
													<span className="text-xs text-red-400 font-medium">
														{t('common:confirm')}
													</span>
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleDelete(collection.id);
														}}
														className="text-xs text-red-400 hover:text-red-300 underline"
													>
														{t('common:yes')}
													</button>
													<button
														onClick={(e) => {
															e.stopPropagation();
															setDeleteConfirm(null);
														}}
														className="text-xs text-gray-400 hover:text-white underline"
													>
														{t('common:no')}
													</button>
												</motion.div>
											)}
										</motion.div>
									);
								})
							)}
						</div>

						{/* Create New Collection */}
						{isCreating ? (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: "auto" }}
								exit={{ opacity: 0, height: 0 }}
								className="space-y-3"
							>
								<input
									type="text"
									value={newCollectionName}
									onChange={(e) => setNewCollectionName(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleCreate()}
									placeholder={t('library:projectNamePlaceholder')}
									className="w-full px-4 py-2 bg-glass-bg-accent border border-glass-border rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
									autoFocus
								/>
								<div className="flex gap-2">
									<button
										onClick={handleCreate}
										disabled={!newCollectionName.trim()}
										className="flex-1 py-2 bg-primary hover:bg-primary/80 disabled:bg-gray-700 disabled:text-gray-500 text-white font-medium rounded-xl transition-all"
									>
										{t('common:create')}
									</button>
									<button
										onClick={() => {
											setIsCreating(false);
											setNewCollectionName("");
										}}
										className="flex-1 py-2 bg-glass-bg-accent hover:bg-glass-bg-active text-gray-300 hover:text-white font-medium rounded-xl transition-all"
									>
										{t('common:cancel')}
									</button>
								</div>
							</motion.div>
						) : (
							<button
								onClick={() => setIsCreating(true)}
								className="w-full py-3 border-2 border-dashed border-gray-700 hover:border-primary rounded-xl text-gray-400 hover:text-primary transition-all flex items-center justify-center gap-2 font-medium"
							>
								<Plus size={18} />
								{t('library:newProject')}
							</button>
						)}
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
