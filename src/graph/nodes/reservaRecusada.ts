import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

export async function reservaRecusada(
    state: RestauranteState
): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        confirmacaoReserva: undefined,
        resposta: Mensagens(MensagensType.ReservaRecusada),
    };
}
