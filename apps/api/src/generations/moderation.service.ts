import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ModerationService {
  private readonly logger = new Logger(ModerationService.name);
  private readonly openai?: OpenAI;

  constructor(config: ConfigService) {
    const key = config.get<string>('OPENAI_API_KEY');
    if (key) this.openai = new OpenAI({ apiKey: key });
  }

  /** Returns true when the prompt should be blocked. Fails open on API errors. */
  async isPromptUnsafe(prompt: string): Promise<boolean> {
    if (!this.openai) return false;
    try {
      const result = await this.openai.moderations.create({
        model: 'omni-moderation-latest',
        input: prompt,
      });
      return result.results[0]?.flagged ?? false;
    } catch (err) {
      this.logger.warn(`Moderation check failed, allowing prompt: ${(err as Error).message}`);
      return false;
    }
  }
}
