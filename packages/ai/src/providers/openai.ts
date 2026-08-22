import type { IAISceneProvider, GenerateSceneOptions, GeneratedVisual } from "./types";

interface OpenAIDallEResponse {
  created: number;
  data: Array<{
    url?: string;
    b64_json?: string;
    revised_prompt?: string;
  }>;
}

interface OpenAIChatResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

export class OpenAISceneProvider implements IAISceneProvider {
  readonly id = "openai" as const;
  readonly name = "OpenAI DALL-E & GPT Vision Scene Generator";

  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, baseUrl = "https://api.openai.com/v1") {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || "";
    this.baseUrl = baseUrl;
  }

  async generateImage(prompt: string, options?: GenerateSceneOptions): Promise<GeneratedVisual> {
    if (!this.apiKey) {
      // In dev fallback mode without key, return mock gradient placeholder
      const encoded = encodeURIComponent(prompt.slice(0, 50));
      return {
        imageUrl: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80&text=${encoded}`,
        prompt,
        provider: "openai",
      };
    }

    // Map 9:16 aspect ratio to DALL-E 3 vertical dimensions (1024x1792)
    const size = options?.aspectRatio === "9:16" ? "1024x1792" : "1024x1024";

    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: `Cinematic vertical video visual, vibrant aesthetic, high quality, artistic atmosphere: ${prompt}`,
        n: 1,
        size,
        quality: "standard",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI DALL-E generation failed (${response.status}): ${errBody}`);
    }

    const data: OpenAIDallEResponse = await response.json();
    const item = data.data[0];

    return {
      imageUrl: item.url || "",
      prompt,
      revisedPrompt: item.revised_prompt,
      provider: "openai",
    };
  }

  async enhancePrompt(captionText: string, context?: { mood?: string; genre?: string }): Promise<string> {
    if (!this.apiKey) {
      const moodText = context?.mood ? ` in a ${context.mood} mood` : "";
      return `Visual scenery illustrating: "${captionText}"${moodText}, cinematic atmospheric lighting, vertical 9:16 wallpaper`;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "You are an expert cinematic visual director. Turn short music lyrics/captions into rich, vivid image generation prompts tailored for vertical video scenes (9:16). Keep it concise (1-2 sentences), atmospheric, and highly visual.",
            },
            {
              role: "user",
              content: `Caption/Lyrics: "${captionText}"\nMusic Mood: ${context?.mood || "energetic"}\nGenre: ${context?.genre || "electronic"}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      if (!response.ok) {
        return `Visual art depicting "${captionText}", ${context?.mood || "cinematic"} lighting`;
      }

      const data: OpenAIChatResponse = await response.json();
      return data.choices[0]?.message?.content?.trim() || captionText;
    } catch {
      return `Visual art depicting "${captionText}", ${context?.mood || "cinematic"} lighting`;
    }
  }
}
