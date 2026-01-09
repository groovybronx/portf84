import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { logger } from './logger';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
