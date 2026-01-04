import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button, cn } from "./Button";
import { createPortal } from "react-dom";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
	size?: "sm" | "md" | "lg" | "xl" | "full";
	className?: string;
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	footer,
	size = "md",
	className,
}) => {
	// Prevent scrolling when modal is open
	React.useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "unset";
		}
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const content = (
		<div className="fixed inset-0 z-(--z-modal) flex items-center justify-center p-4 sm:p-6">
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={onClose}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
						/>

						{/* Modal Content */}
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 10 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 10 }}
							transition={{ duration: 0.2, ease: "easeOut" }}
							className={cn(
								"relative w-full overflow-hidden rounded-2xl border border-glass-border bg-glass-bg shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]",
								{
									"max-w-sm": size === "sm",
									"max-w-md": size === "md",
									"max-w-lg": size === "lg",
									"max-w-2xl": size === "xl",
									"max-w-full h-full rounded-none sm:rounded-2xl":
										size === "full",
								},
								className
							)}
						>
							{/* Header */}
							<div className="flex items-center justify-between px-6 py-4 border-b border-glass-border-light shrink-0">
								<h2 className="text-lg font-semibold text-white truncate pr-4">
									{title}
								</h2>
								<Button
									onClick={onClose}
									variant="close"
									size="icon"
									aria-label="Close modal"
								>
									<X size={20} />
								</Button>
							</div>

							{/* Body */}
							<div className="p-6 overflow-y-auto custom-scrollbar flex-1">
								{children}
							</div>

							{/* Footer */}
							{footer && (
								<div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-glass-border-light bg-black/20 shrink-0">
									{footer}
								</div>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</div>
	);

	return createPortal(content, document.body);
};
