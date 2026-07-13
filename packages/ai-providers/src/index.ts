import { CarouselManifest, validateManifest } from '@carousel-gen/manifest-schema';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
  endpoint?: string;
}

export interface AIProvider {
  generateManifest(topic: string, writingGuidelines: string[]): Promise<CarouselManifest>;
}

// 1. SYSTEM PROMPT CREATOR
export function getSystemPrompt(writingGuidelines: string[]): string {
  const guidelinesStr = writingGuidelines.map((g) => `- ${g}`).join('\n');

  return `You are an expert social media content strategist.
Your job is to generate a highly engaging Instagram Carousel Manifest in strict JSON format based on the user's topic.

CRITICAL RULES:
1. The output MUST be a valid JSON object matching the JSON schema below.
2. Do NOT wrap the JSON in markdown code blocks (e.g. do NOT use \`\`\`json ... \`\`\`). Return ONLY the raw JSON string.
3. Keep text extremely short. Instagram slides should contain less than 30 words total.
4. The first slide MUST be of type 'cover' and layout 'hero'.
5. The last slide MUST be of type 'cta' and layout 'cta'.
6. Choose layout types dynamically for content slides:
   - 'split': for presenting concepts with illustrations
   - 'comparison': for before/after comparison
   - 'quote': for important quotes or key takeaways
   - 'steps': for sequential tutorials/how-tos
   - 'bullets': for lists of items
   - 'features': for feature grids (max 4 features)

JSON Schema definition:
{
  "slides": [
    {
      "type": "cover" | "content" | "comparison" | "quote" | "steps" | "cta",
      "layout": "hero" | "split" | "comparison" | "quote" | "steps" | "bullets" | "cta" | "features",
      "title": "Slide Title text (Required)",
      "subtitle": "Slide Subtitle text (Optional)",
      "description": "Longer paragraph text (Optional)",
      "illustration": "Name of procedural illustration: 'analytics-chart' | 'quote-marks' | 'flow-diagram' | 'growth-arrow' | 'tech-stack' (Optional)",
      "badgeText": "Short badge text, e.g., 'TIP', 'STEP 1', 'WARNING' (Optional)",
      "components": ["badge", "header", "footer"],
      
      // Layout-specific optional fields:
      "bullets": ["Array of string bullet points (For 'bullets' or 'features' layout)"],
      "quote": "Quote text (For 'quote' layout)",
      "author": "Quote author (For 'quote' layout)",
      "before": "Before state description (For 'comparison' layout)",
      "after": "After state description (For 'comparison' layout)",
      "steps": ["Array of steps text (For 'steps' layout)"],
      "ctaLabel": "CTA Button label (For 'cta' layout)"
    }
  ]
}

Theme writing style guidelines to follow:
${guidelinesStr}
`;
}

// Helper to clean markdown JSON wrappers if returned
function cleanJsonString(raw: string): string {
  return raw
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();
}

// 2. GEMINI ADAPTER
export class GeminiProvider implements AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async generateManifest(topic: string, writingGuidelines: string[]): Promise<CarouselManifest> {
    const ai = new GoogleGenerativeAI(this.config.apiKey);
    const model = ai.getGenerativeModel({
      model: this.config.model || 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const systemPrompt = getSystemPrompt(writingGuidelines);
    const userPrompt = `Generate a slide carousel manifest for the topic: "${topic}"`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      systemInstruction: systemPrompt,
    });

    const responseText = result.response.text();
    const cleanText = cleanJsonString(responseText);
    return validateManifest(JSON.parse(cleanText));
  }
}

// 3. OPENAI ADAPTER
export class OpenAIProvider implements AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async generateManifest(topic: string, writingGuidelines: string[]): Promise<CarouselManifest> {
    const client = new OpenAI({ apiKey: this.config.apiKey });
    const systemPrompt = getSystemPrompt(writingGuidelines);
    const userPrompt = `Generate a slide carousel manifest for the topic: "${topic}"`;

    const response = await client.chat.completions.create({
      model: this.config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message.content ?? '';
    const cleanText = cleanJsonString(responseText);
    return validateManifest(JSON.parse(cleanText));
  }
}

// 4. ANTHROPIC ADAPTER
export class AnthropicProvider implements AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async generateManifest(topic: string, writingGuidelines: string[]): Promise<CarouselManifest> {
    const client = new Anthropic({ apiKey: this.config.apiKey });
    const systemPrompt = getSystemPrompt(writingGuidelines);
    const userPrompt = `Generate a slide carousel manifest for the topic: "${topic}"`;

    const response = await client.messages.create({
      model: this.config.model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const contentBlock = response.content[0];
    const responseText = contentBlock?.type === 'text' ? contentBlock.text : '';
    const cleanText = cleanJsonString(responseText);
    return validateManifest(JSON.parse(cleanText));
  }
}

// 5. GROQ ADAPTER
export class GroqProvider implements AIProvider {
  private config: AIProviderConfig;

  constructor(config: AIProviderConfig) {
    this.config = config;
  }

  async generateManifest(topic: string, writingGuidelines: string[]): Promise<CarouselManifest> {
    const client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.endpoint || 'https://api.groq.com/openai/v1',
    });

    const systemPrompt = getSystemPrompt(writingGuidelines);
    const userPrompt = `Generate a slide carousel manifest for the topic: "${topic}"`;

    const response = await client.chat.completions.create({
      model: this.config.model || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = response.choices[0]?.message.content ?? '';
    const cleanText = cleanJsonString(responseText);
    return validateManifest(JSON.parse(cleanText));
  }
}
