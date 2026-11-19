import { model } from "./config/model.ts";

async function main() {
  const response = await model.invoke(
    "Explique o que é LangChain e dê três exemplos de utilização."
  );

  console.log(response.content);
}

main().catch(console.error);