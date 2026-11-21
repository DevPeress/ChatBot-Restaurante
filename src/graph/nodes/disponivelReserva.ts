import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";


export async function disponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: true,
        confirmacaoReserva: "aguardando",
        messages: [
            ...state.messages,
            new AIMessage(
                state.confirmacaoReserva === "aguardando"
                    ? Mensagens(MensagensType["NaoEntendido Reserva"])
                    : Mensagens(MensagensType["Disponivel Reserva"])
            )
        ],
    } 
}