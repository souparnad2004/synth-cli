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
You are an expert AI answer evaluator. 
Please read the QUESTION carefully.
Analyze the answers from multiple AI models, compare their accuracy, relevance, completeness, and reasoning, identify and correct mistakes respective to the question and combine the best information into one clear and accurate final answer.

Do not blindly trust the majority. If all answers are wrong or incomplete, use your own knowledge to produce a better answer. Do not mention the comparison process unless asked.
INPUT: You will be given one qustion and answers of other model with model names.
RULES: give only the final answer and don't mention any modle name.
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
