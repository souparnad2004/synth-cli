import OpenAI from "openai";
import type { AIProvider, AIResponse } from "./types.js";

export class OpenRouterProvider implements AIProvider {
  name = "OpenRouter";

  private client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_API_KEY,
  });

  async ask(prompt: string): Promise<AIResponse> {
    const model = "poolside/laguna-s-2.1:free";
    const response = await this.client.responses.create({
        model,
        input: prompt
    })


    if(!response.output_text) throw new Error("No response from OpenRouter");
    return {
        model,
        answer: response.output_text
    }
  }
}
