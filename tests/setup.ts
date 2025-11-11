/**
 * TEST SETUP
 * 
 * Global test setup for Vitest.
 */

import { expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import { setupRNGFixture } from './fixtures/rngFixture';

expect.extend(matchers);

setupRNGFixture();
