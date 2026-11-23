import { AIMessage } from "@langchain/core/messages";
import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

export async function reservaRecusada(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        confirmacaoReserva: "recusada",
        resposta: Mensagens(MensagensType.ReservaRecusada),
    };
}
