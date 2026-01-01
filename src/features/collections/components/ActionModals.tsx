import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
	FolderPlus,
	FolderInput,
	FolderHeart,
	Plus,
	ArrowLeft,
} from "lucide-react";
import { Folder } from "../../../shared/types";
import { Modal, Button, Input } from "../../../shared/components/ui";

interface CreateFolderModalProps {
	isOpen: boolean;
	onClose: () => void;
	onCreate: (name: string) => void;
}

export const CreateFolderModal: React.FC<CreateFolderModalProps> = ({
	isOpen,
	onClose,
	onCreate,
}) => {
	const [name, setName] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (name.trim()) {
			onCreate(name.trim());
			setName("");
			onClose();
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="New Collection"
			size="sm"
			footer={
				<>
					<Button variant="ghost" onClick={onClose}>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={!name.trim()}
						leftIcon={<FolderPlus size={18} />}
					>
						Create
					</Button>
				</>
			}
		>
			<form onSubmit={handleSubmit} className="py-2">
				<label className="block text-sm text-gray-400 mb-2">
					Collection Name
				</label>
				<Input
					autoFocus
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="e.g. Best of 2024"
					leftIcon={<FolderHeart size={16} />}
				/>
			</form>
		</Modal>
	);
};

interface MoveToFolderModalProps {
	isOpen: boolean;
	onClose: () => void;
	folders: Folder[];
	onMove: (targetFolderId: string) => void;
	onCreateAndMove: (name: string) => void;
	selectedCount: number;
}

export const MoveToFolderModal: React.FC<MoveToFolderModalProps> = ({
	isOpen,
	onClose,
	folders,
	onMove,
	onCreateAndMove,
	selectedCount,
}) => {
	const [isCreating, setIsCreating] = useState(false);
	const [newFolderName, setNewFolderName] = useState("");

	useEffect(() => {
		if (isOpen) {
			setIsCreating(false);
			setNewFolderName("");
		}
	}, [isOpen]);

	const handleCreateSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (newFolderName.trim()) {
			onCreateAndMove(newFolderName.trim());
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={isCreating ? "New Collection & Move" : "Move Items"}
			size="md"
		>
			<div className="mb-4">
				<p className="text-gray-400 text-sm">
					{isCreating
						? `Create a new collection to hold the ${selectedCount} selected item${
								selectedCount > 1 ? "s" : ""
						  }.`
						: `Select a destination for the ${selectedCount} selected photo${
								selectedCount > 1 ? "s" : ""
						  }.`}
				</p>
			</div>

			{isCreating ? (
				<form onSubmit={handleCreateSubmit} className="space-y-4">
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
					>
						<div>
							<label className="block text-sm text-gray-400 mb-2">
								Collection Name
							</label>
							<Input
								autoFocus
								value={newFolderName}
								onChange={(e) => setNewFolderName(e.target.value)}
								placeholder="e.g. Vacation 2024"
								leftIcon={<FolderPlus size={16} />}
							/>
						</div>

						<div className="flex justify-end gap-3 mt-6">
							<Button
								variant="ghost"
								onClick={() => setIsCreating(false)}
								leftIcon={<ArrowLeft size={16} />}
							>
								Back
							</Button>
							<Button
								onClick={handleCreateSubmit}
								disabled={!newFolderName.trim()}
								leftIcon={<FolderInput size={18} />}
							>
								Create & Move
							</Button>
						</div>
					</motion.div>
				</form>
			) : (
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					className="max-h-[300px] overflow-y-auto space-y-2 custom-scrollbar pr-2 -mr-2"
				>
					{/* Create New Option */}
					<Button
						variant="ghost"
						onClick={() => setIsCreating(true)}
						className="w-full justify-start gap-4 p-3 rounded-xl border border-dashed border-glass-border/20 hover:border-purple-500/50 hover:bg-purple-500/10 text-gray-300 hover:text-white h-auto"
					>
						<div className="w-10 h-10 rounded-lg bg-glass-bg-accent flex items-center justify-center text-gray-400 group-hover:text-purple-400 transition-colors">
							<Plus size={20} />
						</div>
						<div className="flex-1">
							<p className="font-medium">Create New Collection</p>
							<p className="text-xs text-gray-500">Add folder and move items</p>
						</div>
					</Button>

					{folders
						.filter((f) => f.isVirtual && !f.sourceFolderId)
						.map((folder) => (
							<Button
								key={folder.id}
								variant="ghost"
								onClick={() => {
									onMove(folder.id);
									onClose();
								}}
								className="w-full justify-start gap-4 p-3 rounded-xl hover:bg-glass-bg-accent border border-transparent hover:border-glass-border-light h-auto"
							>
								<div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
									<FolderHeart size={20} />
								</div>
								<div className="flex-1">
									<p className="font-medium text-white">{folder.name}</p>
									<p className="text-xs text-gray-500">
										{folder.items.length} items
									</p>
								</div>
							</Button>
						))}

					{folders.length === 0 && (
						<div className="text-center py-4 text-gray-500 text-sm">
							No existing folders.
						</div>
					)}
				</motion.div>
			)}
		</Modal>
	);
};
