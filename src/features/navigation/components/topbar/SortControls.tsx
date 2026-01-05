import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpDown } from "lucide-react";
import { SortOption, SortDirection } from "../../../../shared/types";
import { Button, Flex, GlassCard } from "../../../../shared/components/ui";

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
			<GlassCard variant="accent" padding="sm" border as="select"
				value={sortOption}
				onChange={(e: any) => onSortChange(e.target.value as SortOption)}
				className="text-white text-sm focus:ring-blue-500 focus:border-blue-500 outline-none cursor-pointer w-20 appearance-none transition-colors hover:bg-glass-bg-active"
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
			</GlassCard>
			<GlassCard
				variant="accent"
				padding="sm"
				as={Button}
				onClick={onSortDirectionChange}
				className="text-gray-400 hover:text-white cursor-pointer"
			>
				<ArrowUpDown
					size={16}
					className={sortDirection === "desc" ? "transform rotate-180" : ""}
				/>
			</GlassCard>
		</Flex>
	);
};
