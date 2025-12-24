import { GoogleGenAI } from "@google/genai";

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY environment variable is not set. " +
        "Get your API key from https://aistudio.google.com/apikey and add it to .env.local"
    );
  }

  return new GoogleGenAI({ apiKey });
}

// Lazy initialization to avoid errors at module load time
let _client: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (!_client) {
    _client = getGeminiClient();
  }
  return _client;
}

// For backwards compatibility
export const ai = {
  get fileSearchStores() {
    return getAI().fileSearchStores;
  },
  get files() {
    return getAI().files;
  },
  get operations() {
    return getAI().operations;
  },
};
