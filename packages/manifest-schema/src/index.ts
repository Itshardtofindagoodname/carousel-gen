import { z } from 'zod';

export const DummySchema = z.object({
  ok: z.boolean(),
});

export type DummyType = z.infer<typeof DummySchema>;
