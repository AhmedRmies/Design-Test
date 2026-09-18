import OpenAI from 'openai';

const STYLE_HINTS: Record<string, string> = {
  vector: 'flat vector illustration, bold clean shapes, limited flat colour palette, crisp edges',
  illustration: 'detailed hand-drawn illustration, expressive linework, rich colour',
  photoreal: 'photorealistic render, dramatic studio lighting, high detail',
  minimal: 'minimalist line art, single accent colour, generous negative space',
  retro: 'retro 1970s screen-print look, halftone texture, warm muted palette',
  anime: 'anime cel-shaded artwork, bold outlines, vivid colour',
};

/**
 * Turns a short user description into an apparel-optimised prompt.
 * Falls back to a template when no LLM key is configured.
 */
export async function buildPrompt(
  raw: string,
  style: string,
  transparent: boolean,
  openai?: OpenAI,
): Promise<string> {
  const hint = STYLE_HINTS[style] ?? STYLE_HINTS.vector;
  const background = transparent
    ? 'isolated on a fully transparent background, no background elements'
    : 'on a simple solid background';

  if (!openai) {
    return `${raw}. ${hint}, centred composition, ${background}, designed to be screen-printed on a t-shirt.`;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      max_tokens: 160,
      messages: [
        {
          role: 'system',
          content:
            'You rewrite short user descriptions into image-generation prompts for apparel graphics. ' +
            'Keep it under 60 words. Describe only the artwork, never the shirt itself. ' +
            'Return the prompt text only, with no preamble or quotes.',
        },
        { role: 'user', content: `Description: ${raw}\nStyle: ${hint}\nBackground: ${background}` },
      ],
    });
    return completion.choices[0]?.message?.content?.trim() || raw;
  } catch {
    return `${raw}. ${hint}, centred composition, ${background}.`;
  }
}
