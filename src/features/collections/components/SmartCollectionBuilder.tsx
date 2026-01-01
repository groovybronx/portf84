import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Plus, Trash2, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { nanoid } from 'nanoid';
import { SmartCollection, SmartCollectionInput, createSmartCollection, updateSmartCollection } from '../../../services/smartCollectionService';
import { COLOR_PALETTE } from '../../../shared/types';
import { useCollections } from '../../../shared/contexts/CollectionsContext';

interface SmartCollectionBuilderProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: () => void;
	editingCollection?: SmartCollection | null;
}

interface Rule {
	id: string;
	type: 'tag' | 'not_tag' | 'color';
	value: string;
}

export const SmartCollectionBuilder: React.FC<SmartCollectionBuilderProps> = ({
	isOpen,
	onClose,
	onSave,
	editingCollection
}) => {
	const { t } = useTranslation(['library', 'common']);
	const { activeCollection } = useCollections();
	const [name, setName] = useState('');
	const [operator, setOperator] = useState<'AND' | 'OR'>('AND');
	const [rules, setRules] = useState<Rule[]>([]);
	const [icon, setIcon] = useState('filter');
	const [color, setColor] = useState('#3b82f6'); // Default blue

	useEffect(() => {
		if (editingCollection) {
			setName(editingCollection.name);
			try {
				const query = JSON.parse(editingCollection.query);
				setOperator(query.operator || 'AND');
				setRules(query.rules?.map((r: any) => ({ ...r, id: nanoid() })) || []);
			} catch (error) {
				console.error('Failed to parse smart collection query:', error);
				setOperator('AND');
				setRules([]);
			}
			setIcon(editingCollection.icon || 'filter');
			setColor(editingCollection.color || '#3b82f6');
		} else {
			setName('');
			setOperator('AND');
			setRules([{ id: nanoid(), type: 'tag', value: '' }]);
		}
	}, [editingCollection, isOpen]);

	const addRule = () => {
		setRules([...rules, { id: nanoid(), type: 'tag', value: '' }]);
	};

	const removeRule = (id: string) => {
		setRules(rules.filter(r => r.id !== id));
	};

	const updateRule = (id: string, updates: Partial<Rule>) => {
		setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
	};

	const handleSave = async () => {
		if (!name.trim() || rules.length === 0 || !activeCollection) return;

		const input: SmartCollectionInput = {
			collectionId: activeCollection.id,
			name,
			query: {
				operator,
				rules: rules.map(({ type, value }) => ({ type, value }))
			},
			icon,
			color
		};

		try {
			if (editingCollection) {
				await updateSmartCollection(editingCollection.id, input);
			} else {
				await createSmartCollection(input);
			}
			onSave();
			onClose();
		} catch (e) {
			console.error("Failed to save smart collection", e);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<>
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
						className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[--z-modal-overlay]"
					/>
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-background border border-white/10 rounded-xl shadow-2xl z-[--z-modal] flex flex-col max-h-[80vh]"
					>
						{/* Header */}
						<div className="p-6 border-b border-white/10 flex justify-between items-center">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-blue-500/20 rounded-lg">
									<Filter className="w-5 h-5 text-blue-400" />
								</div>
								<h2 className="text-xl font-bold text-white">
									{editingCollection ? t('library:editSmartCollection') : t('library:newSmartCollection')}
								</h2>
							</div>
							<button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
								<X size={20} />
							</button>
						</div>

						{/* Content */}
						<div className="flex-1 overflow-y-auto p-6 space-y-6">
							{/* Name Field */}
							<div className="space-y-2">
								<label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
									{t('library:collectionName')}
								</label>
								<input 
									type="text" 
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder={t('library:smartCollectionNamePlaceholder')}
									className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
								/>
							</div>

							{/* Rules Section */}
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
										{t('library:matchingRules')}
									</label>
									<div className="flex bg-white/5 rounded-lg p-1">
										<button 
											onClick={() => setOperator('AND')}
											className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
												operator === 'AND' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-300'
											}`}
										>
											AND
										</button>
										<button 
											onClick={() => setOperator('OR')}
											className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
												operator === 'OR' ? 'bg-blue-500 text-white' : 'text-gray-500 hover:text-gray-300'
											}`}
										>
											OR
										</button>
									</div>
								</div>

								<div className="space-y-3">
									{rules.map((rule, index) => (
										<div key={rule.id} className="flex gap-2 items-center">
											<select
												value={rule.type}
												onChange={(e) => updateRule(rule.id, { type: e.target.value as any, value: '' })}
												className="bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none"
											>
												<option value="tag">{t('library:tagIs')}</option>
												<option value="not_tag">{t('library:tagIsNot')}</option>
												<option value="color">{t('library:colorIs')}</option>
											</select>

											<div className="flex-1">
												{rule.type === 'color' ? (
													<div className="flex flex-wrap gap-1">
														{Object.entries(COLOR_PALETTE).map(([key, val]) => (
															<button
																key={key}
																onClick={() => updateRule(rule.id, { value: key })}
																className={`w-6 h-6 rounded-full border-2 transition-all ${
																	rule.value === key ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
																}`}
																style={{ backgroundColor: val }}
															/>
														))}
													</div>
												) : (
													<input 
														type="text"
														value={rule.value}
														onChange={(e) => updateRule(rule.id, { value: e.target.value })}
														placeholder={t('library:enterTagName')}
														className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none"
													/>
												)}
											</div>

											{rules.length > 1 && (
												<button 
													onClick={() => removeRule(rule.id)}
													className="p-2 hover:bg-red-500/20 text-gray-500 hover:text-red-400 rounded-lg transition-colors"
												>
													<Trash2 size={14} />
												</button>
											)}
										</div>
									))}
								</div>

								<button 
									onClick={addRule}
									className="w-full py-2 border border-dashed border-white/10 hover:border-blue-500/50 rounded-lg text-xs text-gray-500 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
								>
									<Plus size={14} />
									{t('library:addRule')}
								</button>
							</div>

							{/* Appearance Section */}
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t('library:appearanceColorLabel')}</label>
									<div className="flex gap-2">
										{['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
											<button 
												key={c}
												onClick={() => setColor(c)}
												className={`w-6 h-6 rounded-full border-2 ${color === c ? 'border-white' : 'border-transparent opacity-60'}`}
												style={{ backgroundColor: c }}
											/>
										))}
									</div>
								</div>
								{/* Potential Icon Picker here */}
							</div>
						</div>

						{/* Footer */}
						<div className="p-6 border-t border-white/10 flex justify-end gap-3">
							<button onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
								{t('common:cancel')}
							</button>
							<button 
								onClick={handleSave}
								disabled={!name.trim() || rules.length === 0}
								className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all active:scale-95"
							>
								<Save size={16} />
								{t('common:save')}
							</button>
						</div>
					</motion.div>
				</>
			)}
		</AnimatePresence>
	);
};
