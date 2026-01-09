import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { logger } from './shared/utils/logger';
import '@testing-library/jest-dom/vitest';

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});
