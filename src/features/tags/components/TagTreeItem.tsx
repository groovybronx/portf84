import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Tag, Link2, Link2Off } from 'lucide-react';
import { TagNode } from '../../../shared/types/database';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TagTreeItemProps {
  node: TagNode;
  onSetParent: (tagId: string, parentId: string | null) => void;
  level?: number;
}

export const TagTreeItem: React.FC<TagTreeItemProps> = ({ 
  node, 
  onSetParent, 
  level = 0 
}) => {
  const { t } = useTranslation('tags');
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div 
        className={`flex items-center gap-2 py-1.5 px-2 hover:bg-white/5 rounded-md group transition-colors ${
          level > 0 ? 'ml-4 border-l border-white/10 pl-4' : ''
        }`}
      >
        <div 
          className="w-4 h-4 flex items-center justify-center cursor-pointer text-gray-400 hover:text-white"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
            <div className="w-1 h-1 bg-gray-600 rounded-full" />
          )}
        </div>

        <Tag size={14} className={node.type === 'ai' ? 'text-purple-400' : 'text-blue-400'} />
        
        <span className="text-sm text-gray-200 flex-1 truncate">
          {node.name}
        </span>

        {/* Actions visible on hover */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          {node.parentId ? (
            <button
              onClick={() => onSetParent(node.id, null)}
              className="p-1 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded transition-colors"
              title={t('removeParent')}
            >
              <Link2Off size={14} />
            </button>
          ) : (
             <span className="text-[10px] text-gray-500 italic mr-2">
               {t('root')}
             </span>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {node.children.map(child => (
              <TagTreeItem 
                key={child.id} 
                node={child} 
                onSetParent={onSetParent} 
                level={level + 1} 
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
