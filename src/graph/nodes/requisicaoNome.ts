import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";

export async function requisicaoNome(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        confirmacaoReserva: "listagem",
        resposta: Mensagens(MensagensType.RequisitarNome)
    }; 
}

