import { AIMessage } from "langchain";
import type { RestauranteState } from "../state.ts";


export async function indisponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        messages: [
            ...state.messages,
            new AIMessage(
                "Desculpe, não há disponibilidade para a reserva solicitada.")
        ],
    } 
}