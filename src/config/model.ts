import { ChatOpenRouter } from "@langchain/openrouter";

export const model = new ChatOpenRouter({
  model: "recursive/flint-v1.0:free",
  temperature: 0.5,
});