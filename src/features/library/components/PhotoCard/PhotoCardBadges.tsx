/**
 * PhotoCardBadges Component
 * Displays color tag indicators and selection checkboxes
 */
import React from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface PhotoCardBadgesProps {
	colorTag?: string;
	showColorTags: boolean;
	selectionMode: boolean;
	isSelected: boolean;
}

export const PhotoCardBadges: React.FC<PhotoCardBadgesProps> = ({
	colorTag,
	showColorTags,
	selectionMode,
	isSelected,
}) => {
	return (
		<>
			{/* Color Tag Indicators */}
			{showColorTags && colorTag && (
				<>
					{/* Bottom color bar */}
					<div
						className="absolute bottom-0 left-0 right-0 h-1 z-20"
						style={{ backgroundColor: colorTag }}
					/>
					{/* Top-left color dot */}
					<div
						className="absolute top-3 left-3 w-3 h-3 rounded-full shadow-lg z-20 border border-black/20"
						style={{ backgroundColor: colorTag }}
					/>
				</>
			)}

			{/* Selection Checkbox */}
			{selectionMode && (
				<div className="absolute top-3 right-3 z-20">
					{isSelected ? (
						<CheckCircle2
							className="text-blue-500 drop-shadow-lg bg-white rounded-full"
							size={24}
							fill="white"
						/>
					) : (
						<Circle className="text-white/70 drop-shadow-lg" size={24} />
					)}
				</div>
			)}
		</>
	);
};
