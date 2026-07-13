import { expect, test } from 'vitest';
import { greeting } from './index.js';

test('greeting exists', () => {
  expect(greeting).toBe('Hello from common');
});
