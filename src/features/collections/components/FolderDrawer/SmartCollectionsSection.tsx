import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, Edit2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SmartCollection } from '../../../../services/smartCollectionService';
import { Button, Flex, Stack } from '../../../../shared/components/ui';

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
		<Stack gap="sm" className="mt-6">
			<Flex justify="between" align="center" className="px-1 mb-2">
				<Flex align="center" gap="sm">
					<Sparkles size={14} className="text-blue-400" />
					<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
						{t('library:smartCollections')}
					</span>
				</Flex>
				<Button
					variant="glass-icon"
					size="icon-sm"
					onClick={onCreate}
					aria-label="Create smart collection"
				>
					<Plus size={14} />
				</Button>
			</Flex>

			<Stack gap="xs">
				{collections.map((c) => (
					<motion.div
						key={c.id}
						layout
						onClick={() => onSelect(activeId === c.id ? null : c.id)}
					>
						<Flex
							align="center"
							justify="between"
							className={`group p-2 rounded-lg cursor-pointer transition-all ${
							activeId === c.id 
								? 'bg-blue-500/20 border border-blue-500/30' 
								: 'hover:bg-white/5 border border-transparent'
						}`}
					>
						<Flex align="center" gap="sm" className="min-w-0">
							<div 
								className="w-2 h-2 rounded-full shadow-lg" 
								style={{ backgroundColor: c.color || '#3b82f6', boxShadow: `0 0 8px ${c.color || '#3b82f6'}44` }} 
							/>
							<span className={`text-sm truncate ${activeId === c.id ? 'text-blue-200' : 'text-gray-400 group-hover:text-gray-200'}`}>
								{c.name}
							</span>
							</Flex>

						<Flex align="center" gap="xs" className="opacity-0 group-hover:opacity-100 transition-opacity">
							<Button
								variant="glass-icon"
								size="icon-sm"
								onClick={(e) => { e.stopPropagation(); onEdit(c); }}
								className="hover:bg-white/10"
							>
								<Edit2 size={12} />
							</Button>
							<Button
								variant="glass-icon"
								size="icon-sm"
								onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
								className="hover:bg-red-500/10 hover:text-red-400"
							>
								<Trash2 size={12} />
							</Button>
						</Flex>
						</Flex>
					</motion.div>
				))}
				
				{collections.length === 0 && (
					<div className="py-4 text-center text-[11px] text-gray-600 italic">
						No smart collections yet
					</div>
				)}
			</Stack>
		</Stack>
	);
};
