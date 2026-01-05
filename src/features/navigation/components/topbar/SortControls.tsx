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
			<GlassCard variant="accent" padding="sm" border
				className="text-white text-sm focus:ring-blue-500 focus:border-blue-500 outline-none w-20 appearance-none transition-colors hover:bg-glass-bg-active"
			>
				<select
				value={sortOption}
				onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
					onSortChange(event.target.value as SortOption)
				}
				className="w-full bg-transparent outline-none cursor-pointer"
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
			</GlassCard>
			<Button
				variant="glass"
				size="icon-sm"
				onClick={onSortDirectionChange}
				className="text-gray-400 hover:text-white"
			>
				<ArrowUpDown
					size={16}
					className={sortDirection === "desc" ? "transform rotate-180" : ""}
				/>
			</Button>
		</Flex>
	);
};
