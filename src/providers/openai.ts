import {OpenAI} from "openai";
import type { AIProvider, AIResponse } from "./types.js";

export class OpenAiProvider implements AIProvider {
    name = "OpenAI";
    private client = new OpenAI({apiKey: process.env.OPENAI_API_KEY});

    async ask(prompt: string): Promise<AIResponse> {
        const response = await this.client.responses.create({
            model: "gpt-4o-mini",
            input: prompt
        })

        return {
            model: response.model,
            answer: response.output_text,
        }
    }
}