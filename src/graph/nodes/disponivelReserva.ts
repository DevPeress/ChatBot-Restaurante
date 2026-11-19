import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";


export async function disponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: true,
        messages: [
            ...state.messages,
            new AIMessage('Reserva disponível! Posso confirmar a reserva para você?')
        ],
    } 
}