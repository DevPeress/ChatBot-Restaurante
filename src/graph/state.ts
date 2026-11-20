import { MessagesZodMeta } from "@langchain/langgraph";
import type { BaseMessage } from "@langchain/core/messages";
import { withLangGraph } from "@langchain/langgraph/zod";
import { z } from "zod";

export const RestauranteData = z.object({
    messages: withLangGraph(z.array(z.any()), MessagesZodMeta),
    nomeReservado: z.string().optional(),
    qtdePessoas: z.number().optional(),
    dataHora: z.string().optional(),
    classificacaoDoPedido: z.enum(["Alta", "Média", "Baixa", "Desconhecido"]).optional(),
    confirmacaoReserva: z.enum(["aguardando", "confirmada", "recusada"]).optional(),
    idReserva: z.number().int().positive().optional(),
    sucesso: z.boolean().optional(),
    erro: z.string().optional(),
});

export type RestauranteState =
    Omit<z.infer<typeof RestauranteData>, "messages"> & {
        messages: BaseMessage[];
    };
