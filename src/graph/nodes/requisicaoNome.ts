import type { RestauranteState } from "../state.ts";
import { AIMessage } from "langchain";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

export async function requisicaoNome(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        confirmacaoReserva: "listagem",
        messages: [
            ...state.messages,
            new AIMessage(Mensagens(MensagensType.RequisitarNome)),
        ],
    }; 
}

