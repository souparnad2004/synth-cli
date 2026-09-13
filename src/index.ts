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

const providers: AIProvider[] = [
  new OpenAiProvider(),
  new GeminiProvider(),
  new OpenRouterProvider(),
];

async function main() {
  console.log(`Asking: ${question}...\n`);

  const results = await Promise.allSettled(
    providers.map((provider) => provider.ask(question)),
  );
  const answerDB: string[] = [];
  answerDB.push(`QUESTION: ${question}`);
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      const responseString: string =
        result.value.model + "\n" + result.value.answer;
      answerDB.push(responseString);
    } else {
      //You can remove this if you want don't want to see internal model errors
      const error = result.reason;
      if (error?.status === 429 || error?.code === 429) {
        const targetModel =
          error.details?.[1]?.quotaDimensions?.model || "Gemini Model";

        console.error(`\n✗ Rate Limit Exceeded`);
        console.error(`  Model:      ${targetModel}`);
        console.error(
          `  Quota:      You hit the 20 requests/day limit on the Free Tier.`,
        );
      } else if (error?.status === 401 || error?.code === 401) {
        console.log(`✗ Invalid API key provided.`);
      } else if (error?.status >= 500 || error?.code >= 500) {
        console.log(`✗ Server error: The provider is temporarily unavailable.`);
      } else {
        console.log(`✗ Request failed: ${error.message || error}`);
      }
      console.log("\n")
    }
  });

  const comparisonProvider = new ComparisonProvider();
  comparisonProvider.getFinalAnswer(answerDB.join("\n"));
}

main();
