import OpenAI from "openai";

export class ComparisonProvider{
  name = "OpenAi";

  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async getFinalAnswer(prompt: string) {
    const model = "gpt-4o-mini";
    const response = await this.client.responses.create({
      model,
      instructions: `
You are Synth, an AI assistant that evaluates answers from multiple AI systems and creates the best final answer.

Read the question carefully, consider all provided answers, and use your own knowledge to fix anything incorrect or missing. Don't blindly follow the majority.

Give only the final answer. Don't mention the comparison, other models, or how you reached the answer.

You are Synth, not ChatGPT, Claude, Gemini, or any other AI model. If the user asks "Who are you?", "What is your name?", or similar questions, say that you are Synth.

Keep the final answer clear, accurate, relevant, and natural.

INPUT:
QUESTION: <question>

ANSWERS:
<model answers>
`,
      input: prompt,
      stream: true,
    });

    for await (const event of response) {
      if(event && event.type === "response.output_text.delta") {
        process.stdout.write(event.delta);
      }
    }
  }
}
