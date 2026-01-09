import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "./ui";

import { logger } from '../utils/logger';
interface ErrorLog {
	error: Error;
	errorInfo?: ErrorInfo;
	feature: string;
	timestamp: string;
	userAgent: string;
}

const ERROR_STORAGE_KEY = "lumina_error_logs";
const MAX_STORED_ERRORS = 50;

function logError(log: ErrorLog): void {
	try {
		// Console log for development
		console.error("[Error Logger]", {
			feature: log.feature,
			timestamp: log.timestamp,
			error: log.error.message,
			stack: log.error.stack,
		});

		// Store in localStorage for review
		const stored = getStoredErrors();
		stored.unshift({
			message: log.error.message,
			stack: log.error.stack,
			feature: log.feature,
			timestamp: log.timestamp,
			componentStack: log.errorInfo?.componentStack,
		});

		// Keep only recent errors
		const trimmed = stored.slice(0, MAX_STORED_ERRORS);
		localStorage.setItem(ERROR_STORAGE_KEY, JSON.stringify(trimmed));
	} catch (storageError) {
		logger.error("Failed to log error:", storageError);
	}
}

function getStoredErrors(): any[] {
	try {
		const stored = localStorage.getItem(ERROR_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch {
		return [];
	}
}

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	featureName?: string;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
	onReset?: () => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	constructor(props: Props) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		const { featureName, onError } = this.props;

		// Log error
		logError({
			error,
			errorInfo,
			feature: featureName || "unknown",
			timestamp: new Date().toISOString(),
			userAgent: navigator.userAgent,
		});

		// Custom error handler
		onError?.(error, errorInfo);

		logger.error('app', 'Error in ${featureName || "App"}:', error, errorInfo);
	}

	handleReset = () => {
		this.props.onReset?.();
		this.setState({ hasError: false, error: null });
	};

	render() {
		const { hasError, error } = this.state;
		const { children, fallback, featureName } = this.props;

		if (hasError) {
			// Custom fallback
			if (fallback) return fallback;

			// Default fallback UI (will be created next)
			return (
				<div className="flex items-center justify-center min-h-[400px] p-8">
					<div className="max-w-md w-full bg-glass-bg border border-glass-border rounded-xl p-8 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
							<svg
								className="w-8 h-8 text-red-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
								/>
							</svg>
						</div>

						<h2 className="text-xl font-semibold text-white mb-2">
							Something Went Wrong
						</h2>

						<p className="text-gray-400 text-sm mb-4">
							{featureName
								? `An error occurred in the ${featureName} feature.`
								: "An unexpected error occurred."}
						</p>

						{error && (
							<details className="mb-6 text-left">
								<summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-300">
									Error Details
								</summary>
								<pre className="mt-2 p-3 bg-black/50 rounded text-xs text-red-300 overflow-auto max-h-32">
									{error.message}
								</pre>
							</details>
						)}

						<Button
							onClick={this.handleReset}
							variant="primary"
							size="md"
							className="w-full bg-blue-600 hover:bg-blue-500"
							icon={
								<svg
									className="w-4 h-4"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
									/>
								</svg>
							}
							iconPosition="left"
						>
							Try Again
						</Button>
					</div>
				</div>
			);
		}

		return children;
	}
}

// Export error management functions
export { getStoredErrors };
export function clearStoredErrors(): void {
	localStorage.removeItem(ERROR_STORAGE_KEY);
}
