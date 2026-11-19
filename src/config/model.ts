import { ChatOpenRouter } from "@langchain/openrouter";

export const model = new ChatOpenRouter({
  model: "inclusionai/ling-3.2-flash:free",
  temperature: 0.5,
});