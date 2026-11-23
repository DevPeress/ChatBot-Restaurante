import type { RestauranteState } from "../state.ts";
import { Mensagens, MensagensType } from "../../config/mensagens.ts";


export async function indisponivelReserva(state: RestauranteState): Promise<Partial<RestauranteState>> {
    return {
        sucesso: false,
        resposta: Mensagens(MensagensType.IndisponivelReserva),
    } 
}