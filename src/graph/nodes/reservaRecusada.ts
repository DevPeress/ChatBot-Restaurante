import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";

export async function reservaRecusada(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        confirmacaoReserva: "recusada",
        messages: [
            ...state.messages,
            new AIMessage("Tudo bem, não vou confirmar a reserva."),
        ],
    };
}
