import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmartCollection } from '../../../services/smartCollectionService';

interface SmartCollectionsSectionProps {
	collections: SmartCollection[];
	activeId: string | null;
	onSelect: (id: string | null) => void;
	onEdit: (collection: SmartCollection) => void;
	onDelete: (id: string) => void;
	onCreate: () => void;
}

export const SmartCollectionsSection: React.FC<SmartCollectionsSectionProps> = ({
	collections,
	activeId,
	onSelect,
	onEdit,
	onDelete,
	onCreate
}) => {
	const { t } = useTranslation(['library']);

	return (
		<div className="space-y-2 mt-6">
			<div className="flex items-center justify-between px-1 mb-2">
				<div className="flex items-center gap-2">
					<Sparkles size={14} className="text-blue-400" />
					<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
						{t('library:smartCollections')}
					</span>
				</div>
				<button 
					onClick={onCreate}
					className="p-1 hover:bg-white/5 rounded text-gray-400 hover:text-blue-400 transition-colors"
				>
					<Plus size={14} />
				</button>
			</div>

			<div className="space-y-1">
				{collections.map((c) => (
					<motion.div
						key={c.id}
						layout
						className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
							activeId === c.id 
								? 'bg-blue-500/20 border border-blue-500/30' 
								: 'hover:bg-white/5 border border-transparent'
						}`}
						onClick={() => onSelect(activeId === c.id ? null : c.id)}
					>
						<div className="flex items-center gap-3 min-w-0">
							<div 
								className="w-2 h-2 rounded-full shadow-lg" 
								style={{ backgroundColor: c.color || '#3b82f6', boxShadow: `0 0 8px ${c.color || '#3b82f6'}44` }} 
							/>
							<span className={`text-sm truncate ${activeId === c.id ? 'text-blue-200' : 'text-gray-400 group-hover:text-gray-200'}`}>
								{c.name}
							</span>
						</div>

						<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
							<button
								onClick={(e) => { e.stopPropagation(); onEdit(c); }}
								className="p-1.5 hover:bg-white/10 rounded text-gray-500 hover:text-white transition-colors"
							>
								<Edit2 size={12} />
							</button>
							<button
								onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
								className="p-1.5 hover:bg-red-500/10 rounded text-gray-500 hover:text-red-400 transition-colors"
							>
								<Trash2 size={12} />
							</button>
						</div>
					</motion.div>
				))}
				
				{collections.length === 0 && (
					<div className="py-4 text-center text-[11px] text-gray-600 italic">
						No smart collections yet
					</div>
				)}
			</div>
		</div>
	);
};
