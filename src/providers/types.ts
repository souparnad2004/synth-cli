export interface AIResponse {
  model: string;
  answer: string;
}

export interface AIProvider {
  name: string;
  ask(prompt: string): Promise<AIResponse>;
}