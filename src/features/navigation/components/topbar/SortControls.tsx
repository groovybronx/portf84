import React from "react";
import { ArrowUpDown } from "lucide-react";
import { SortOption, SortDirection } from "../../../../shared/types";
import { Button } from "../../../../shared/components/ui";

interface SortControlsProps {
	sortOption: SortOption;
	sortDirection: SortDirection;
	onSortChange: (option: SortOption) => void;
	onSortDirectionChange: () => void;
}

export const SortControls: React.FC<SortControlsProps> = ({
	sortOption,
	sortDirection,
	onSortChange,
	onSortDirectionChange,
}) => {
	return (
		<div className="hidden lg:flex items-center gap-1">
			<select
				value={sortOption}
				onChange={(e) => onSortChange(e.target.value as SortOption)}
				className="bg-black/50 text-white border border-glass-border-light text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer w-20 appearance-none"
			>
				<option value="date" className="bg-gray-900">
					Date
				</option>
				<option value="name" className="bg-gray-900">
					Name
				</option>
				<option value="size" className="bg-gray-900">
					Size
				</option>
			</select>
			<Button
				variant="ghost"
				size="icon"
				onClick={onSortDirectionChange}
				className="bg-glass-bg-accent border-glass-border-light hover:bg-glass-bg-active text-gray-400"
			>
				<ArrowUpDown
					size={16}
					className={sortDirection === "desc" ? "transform rotate-180" : ""}
				/>
			</Button>
		</div>
	);
};
