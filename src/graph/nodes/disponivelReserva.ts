import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";


export async function disponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: true,
        confirmacaoReserva: "aguardando",
        messages: [
            ...state.messages,
            new AIMessage(
                state.confirmacaoReserva === "aguardando"
                    ? "Não entendi sua resposta. Deseja confirmar a reserva? Responda sim ou não."
                    : "Reserva disponível! Deseja confirmar a reserva? Responda sim ou não."
            )
        ],
    } 
}