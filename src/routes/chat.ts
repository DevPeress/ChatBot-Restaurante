import { AIMessage, HumanMessage } from "@langchain/core/messages";
import type { FastifyPluginAsync } from "fastify";
import { graphData } from "../graph/graph.ts";

interface ChatRequest {
  message: string;
  messages?: Array<{
    role: "human" | "ai";
    content: string;
  }>;
  nomeReservado?: string;
  qtdePessoas?: number;
  dataHora?: string;
  classificacaoDoPedido?: "Alta" | "Média" | "Baixa" | "Desconhecido";
  confirmacaoReserva?: "aguardando" | "confirmada" | "recusada";
  sucesso?: boolean;
  erro?: string;
}

export const chatRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post<{ Body: ChatRequest }>(
    "/chat",
    {
      schema: {
        body: {
          type: "object",
          required: ["message"],
          additionalProperties: false,
          properties: {
            message: { type: "string", minLength: 1 },
            messages: {
              type: "array",
              items: {
                type: "object",
                required: ["role", "content"],
                additionalProperties: false,
                properties: {
                  role: { type: "string", enum: ["human", "ai"] },
                  content: { type: "string" },
                },
              },
            },
            nomeReservado: { type: "string" },
            qtdePessoas: { type: "integer", minimum: 1 },
            dataHora: { type: "string" },
            classificacaoDoPedido: {
              type: "string",
              enum: ["Alta", "Média", "Baixa", "Desconhecido"],
            },
            confirmacaoReserva: {
              type: "string",
              enum: ["aguardando", "confirmada", "recusada"],
            },
            sucesso: { type: "boolean" },
            erro: { type: "string" },
          },
        },
      },
    },
    async (request) => {
      const { message, messages = [], ...state } = request.body;

      const result = await graphData.invoke({
        ...state,
        messages: [
          ...messages.map(({ role, content }) =>
            role === "human"
              ? new HumanMessage(content)
              : new AIMessage(content),
          ),
          new HumanMessage(message),
        ],
      });

      return {
        ...result,
        messages: result.messages.map((item) => ({
          role: item.getType() === "human" ? "human" : "ai",
          content: item.content,
        })),
      };
    },
  );
};
