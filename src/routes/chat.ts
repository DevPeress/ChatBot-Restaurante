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
  intencao?: "reserva" | "cancelamento" | "listagem" | "confirmada" | "recusada" | "aguardando" | "desconhecida";
  confirmacaoReserva?: "aguardando" | "confirmada" | "recusada" | "listagem" | "cancelar" | "nome";
  idReserva?: number;
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
            intencao: {
              type: "string",
              enum: ["reserva", "cancelamento", "listagem", "confirmada", "recusada", "aguardando", "desconhecida"],
            },
            confirmacaoReserva: {
              type: "string",
              enum: ["aguardando", "confirmada", "recusada", "listagem", "cancelar", "nome"],
            },
            idReserva: { type: "integer", minimum: 1 },
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
