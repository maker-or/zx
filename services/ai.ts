export interface AIStoryRequest {
  memory: string;
  memoryDate: string;
  storyType: 'therapeutic' | 'inspirational';
  reflectionType: 'weekly' | 'monthly' | 'yearly';
  userContext?: string; // optional context about the user
}

export interface AIStoryResponse {
  story: string;
  storyType: 'therapeutic' | 'inspirational';
  promptUsed: string;
  wordCount: number;
}

export class AIService {
  private apiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Generate an uplifting story based on a memory
   */
  async generateStory(request: AIStoryRequest): Promise<AIStoryResponse> {
    console.log(`[DEBUG] AIService.generateStory called with:`, {
      storyType: request.storyType,
      reflectionType: request.reflectionType,
      memoryDate: request.memoryDate,
      memoryPreview: request.memory.substring(0, 100) + '...',
      hasUserContext: !!request.userContext,
    });

    const prompt = this.buildPrompt(request);
    console.log(
      `[DEBUG] Generated prompt (${prompt.length} chars):`,
      prompt.substring(0, 200) + '...'
    );

    try {
      console.log(`[DEBUG] Making API request to OpenRouter...`);
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://yourapp.com', // Replace with your app domain
          'X-Title': 'Daily Memory Journal',
        },
        body: JSON.stringify({
          model: 'sarvamai/sarvam-m:free', // Fast and good for this use case
          messages: [
            {
              role: 'system',
              content: this.getSystemPrompt(request.storyType, request.reflectionType),
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: this.getMaxTokens(request.reflectionType),
          temperature: 0.7, // Creative but consistent
          top_p: 0.9,
        }),
      });

      console.log(`[DEBUG] API Response status: ${response.status}`);

      if (!response.ok) {
        let errorMessage = `OpenRouter API error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          console.error(`[ERROR] OpenRouter API error response:`, errorData);
          errorMessage += ` - ${errorData.error?.message || 'Unknown API error'}`;
        } catch (parseError) {
          console.error(`[ERROR] Failed to parse error response:`, parseError);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log(`[DEBUG] API Response data:`, {
        hasChoices: !!data.choices,
        choicesLength: data.choices?.length,
        hasContent: !!data.choices?.[0]?.message?.content,
        usage: data.usage,
      });

      const story = data.choices[0]?.message?.content;

      if (!story) {
        console.error(`[ERROR] No story in API response:`, data);
        throw new Error('No story generated from AI response');
      }

      const wordCount = story.trim().split(/\s+/).length;
      console.log(`[DEBUG] Story generated successfully: ${wordCount} words`);

      return {
        story: story.trim(),
        storyType: request.storyType,
        promptUsed: prompt,
        wordCount,
      };
    } catch (error) {
      console.error('[ERROR] AI Story Generation Error:', error);

      // Provide more specific error messages
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          'Network error: Unable to connect to AI service. Please check your internet connection.'
        );
      }

      if (error instanceof Error && error.message.includes('401')) {
        throw new Error('API key authentication failed. Please check your OpenRouter API key.');
      }

      if (error instanceof Error && error.message.includes('429')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }

      throw new Error(
        `Failed to generate story: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Build the user prompt based on the memory and context
   */
  private buildPrompt(request: AIStoryRequest): string {
    console.log(
      `[DEBUG] Building prompt for ${request.storyType} ${request.reflectionType} reflection`
    );
    const { memory, memoryDate, storyType, reflectionType } = request;

    const basePrompt = `Here is a memory from ${memoryDate}:\n\n"${memory}"\n\n`;

    const storyTypeInstructions = {
      therapeutic: `Please create a therapeutic reframing of this memory. Help me see this experience in a new light that promotes healing, understanding, and personal growth. Focus on:
- What this experience might have taught me
- How it contributed to my resilience and strength
- Any hidden gifts or lessons within the difficulty
- A compassionate perspective that honors my feelings while offering hope`,

      inspirational: `Please create an inspirational narrative based on this memory. Transform this experience into a source of motivation and empowerment. Focus on:
- The courage and strength I showed during this experience
- How this moment connects to my larger journey of growth
- The positive impact this experience may have on my future
- An uplifting perspective that celebrates my resilience`,
    };

    const lengthInstructions = {
      weekly: 'Keep the response between 200-400 words.',
      monthly: 'Keep the response between 400-600 words, providing deeper insights.',
      yearly: 'Keep the response between 600-800 words, offering profound life reflections.',
    };

    return `${basePrompt}${storyTypeInstructions[storyType]}\n\n${lengthInstructions[reflectionType]}\n\nWrite in a warm, supportive tone as if speaking to a dear friend.`;
  }

  /**
   * Get system prompt based on story type and reflection level
   */
  private getSystemPrompt(
    storyType: 'therapeutic' | 'inspirational',
    reflectionType: string
  ): string {
    const baseSystem = `You are a compassionate AI assistant specializing in ${storyType} storytelling for personal growth and healing. Your role is to help people reframe their memories in positive, empowering ways.`;

    const guidelines = `
Guidelines:
- Always maintain a warm, supportive, and non-judgmental tone
- Acknowledge the person's feelings and experiences as valid
- Focus on growth, resilience, and positive reframing
- Use "you" to speak directly to the person
- Avoid clinical language; write like a wise, caring friend
- Never minimize or dismiss difficult experiences
- Find genuine insights and meaning, not superficial positivity
- End with hope and encouragement for the future`;

    return `${baseSystem}\n${guidelines}`;
  }

  /**
   * Get max tokens based on reflection type
   */
  private getMaxTokens(reflectionType: string): number {
    switch (reflectionType) {
      case 'weekly':
        return 600; // ~400 words
      case 'monthly':
        return 900; // ~600 words
      case 'yearly':
        return 1200; // ~800 words
      default:
        return 600;
    }
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<boolean> {
    console.log(`[DEBUG] Testing OpenRouter API connection...`);
    try {
      const response = await fetch('https://openrouter.ai/api/v1/models', {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });
      console.log(`[DEBUG] Connection test response: ${response.status}`);
      const isConnected = response.ok;
      console.log(`[DEBUG] API connection test result: ${isConnected}`);
      return isConnected;
    } catch (error) {
      console.error('[ERROR] OpenRouter connection test failed:', error);
      return false;
    }
  }

  /**
   * Validate API key format
   */
  validateApiKey(): boolean {
    const isValid = !!(this.apiKey && this.apiKey.length > 0 && this.apiKey.startsWith('sk-'));
    console.log(`[DEBUG] API key validation: ${isValid}`);
    return isValid;
  }
}
