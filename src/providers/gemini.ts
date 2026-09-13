import { GoogleGenAI } from "@google/genai";
import type { AIProvider, AIResponse } from "./types.js";

export class GeminiProvider implements AIProvider {
    name = "Gemini";

    private client = new GoogleGenAI({
        vertexai: false,
        apiKey: process.env.GEMINI_API_KEY!
    })

    async ask(prompt: string): Promise<AIResponse> {
        const model = "gemini-3.6-flash";
        const response = await this.client.models.generateContent({
            model,
            contents: prompt,
        })
        if(!response.text) {
            throw new Error("No response from Gemini")
        }
        return {
            model,
            answer: response.text,
        }
    }
}