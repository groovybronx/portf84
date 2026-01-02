import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown } from "lucide-react";
import { SortOption, SortDirection } from "../../../../shared/types";
import { Button, Flex } from "../../../../shared/components/ui";

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
	const { t } = useTranslation("navigation");
	return (
		<Flex align="center" gap="xs" className="hidden lg:flex">
			<select
				value={sortOption}
				onChange={(e) => onSortChange(e.target.value as SortOption)}
				className="bg-glass-bg-accent text-white border border-glass-border-light text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer w-20 appearance-none transition-colors hover:bg-glass-bg-active"
			>
				<option value="date" className="bg-gray-900">
					{t('date')}
				</option>
				<option value="name" className="bg-gray-900">
					{t('name')}
				</option>
				<option value="size" className="bg-gray-900">
					{t('size')}
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
		</Flex>
	);
};
