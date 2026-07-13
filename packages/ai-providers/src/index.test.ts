import { describe, expect, test, vi } from 'vitest';
import { getSystemPrompt, OpenAIProvider, GeminiProvider } from './index.js';

// Mock OpenAI
vi.mock('openai', () => {
  return {
    OpenAI: vi.fn().mockImplementation(() => {
      return {
        chat: {
          completions: {
            create: vi.fn().mockResolvedValue({
              choices: [
                {
                  message: {
                    content: JSON.stringify({
                      slides: [
                        {
                          type: 'cover',
                          layout: 'hero',
                          title: 'Mocked Title',
                        },
                      ],
                    }),
                  },
                },
              ],
            }),
          },
        },
      };
    }),
  };
});

// Mock Gemini
vi.mock('@google/generative-ai', () => {
  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => {
      return {
        getGenerativeModel: vi.fn().mockReturnValue({
          generateContent: vi.fn().mockResolvedValue({
            response: {
              text: vi.fn().mockReturnValue(
                JSON.stringify({
                  slides: [
                    {
                      type: 'cover',
                      layout: 'hero',
                      title: 'Mocked Gemini Title',
                    },
                  ],
                }),
              ),
            },
          }),
        }),
      };
    }),
  };
});

describe('AI Providers', () => {
  test('system prompt includes writing guidelines', () => {
    const prompt = getSystemPrompt(['Use HSL colors', 'Limit to 3 slides']);
    expect(prompt).toContain('Use HSL colors');
    expect(prompt).toContain('Limit to 3 slides');
    expect(prompt).toContain('JSON Schema');
  });

  test('OpenAIProvider parses and validates response correctly', async () => {
    const provider = new OpenAIProvider({ apiKey: 'mock-key' });
    const manifest = await provider.generateManifest('My Topic', ['Guideline']);
    expect(manifest.slides[0]?.title).toBe('Mocked Title');
  });

  test('GeminiProvider parses and validates response correctly', async () => {
    const provider = new GeminiProvider({ apiKey: 'mock-key' });
    const manifest = await provider.generateManifest('My Topic', ['Guideline']);
    expect(manifest.slides[0]?.title).toBe('Mocked Gemini Title');
  });
});
