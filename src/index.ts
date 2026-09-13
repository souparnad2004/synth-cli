#!/usr/bin/env node

import { ComparisonProvider } from "./providers/comparison.js";
import { OpenRouterProvider } from "./providers/freeModel.js";
import { GeminiProvider } from "./providers/gemini.js";
import { OpenAiProvider } from "./providers/openai.js";
import type { AIProvider } from "./providers/types.js";

// Load the project's .env file when the script is run directly
// (e.g. via the `synth` bin without `node --env-file=.env`),
// so API keys are available before any provider constructs its client.
// Existing environment variables are never overridden, and a missing
// .env (e.g. global install) is ignored — real env vars still work.
try {
  process.loadEnvFile(new URL("../.env", import.meta.url));
} catch {
  console.warn(".env file not found");
}

const question = process.argv.slice(2).join(" ");

if (!question) {
  console.log("Usage: node index.js 'question'");
  process.exit(1);
}

const providers: AIProvider[] = [new OpenAiProvider(), new GeminiProvider(), new OpenRouterProvider()];

async function main() {
  console.log(`Asking: ${question}...\n`);

  const results = await Promise.allSettled(
    providers.map((provider) => provider.ask(question)),
  );
  const answerDB: string[] = [];
  answerDB.push(`QUESTION: ${question}`);
  results.forEach((result) => {
    if(result.status === "fulfilled") {
      const responseString: string = result.value.model + "\n" + result.value.answer; 
      answerDB.push(responseString);
    } else {
      const meta = result.reason.error.metadata;
      
      console.error(`\n⚠️  [${meta.provider_name || 'OpenRouter'} Error ${result.reason.status}]: Provider returned error`);
      console.error(`🛑 Reason: ${meta.raw}`);
      console.error(`💡 Tip: ${meta.remedy_hint}\n`);
      
      process.exit(1);
    }
  })

  const comparisonProvider = new ComparisonProvider();
  comparisonProvider.getFinalAnswer(answerDB.join('\n'))
}

main();
